import { BadRequestException, Injectable, Inject, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ResultData } from 'src/common/utils/result';
import { SysUploadEntity } from './entities/upload.entity';
import { ChunkFileDto, ChunkMergeFileDto } from './dto/index';
import { GenerateUUID } from 'src/common/utils/index';
import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';
import COS from 'cos-nodejs-sdk-v5';
import Mime from 'mime-types';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  private thunkDir: string;
  private readonly cos: COS;
  private isLocal: boolean;
  constructor(
    @InjectRepository(SysUploadEntity)
    private readonly sysUploadEntityRep: Repository<SysUploadEntity>,
    @Inject(ConfigService)
    private config: ConfigService,
  ) {
    this.thunkDir = 'thunk';
    this.isLocal = this.config.get('app.file.isLocal');
    this.cos = new COS({
      SecretId: this.config.get('cos.secretId'),
      SecretKey: this.config.get('cos.secretKey'),
      FileParallelLimit: 3,
      ChunkParallelLimit: 8,
      ChunkSize: 1024 * 1024 * 8,
    });
  }

  /**
   * 单文件上传
   * @param file
   * @returns
   */
  async singleFileUpload(file: Express.Multer.File) {
    if (!file?.buffer?.length) throw new BadRequestException('上传图片内容为空');
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedMimeTypes.includes(file.mimetype?.toLowerCase())) {
      throw new BadRequestException('仅支持 JPG、PNG、WebP 或 HEIC 图片');
    }
    const maxSizeMb = Number(this.config.get('app.file.maxSize') || 10);
    if (file.size > maxSizeMb * 1024 * 1024) throw new BadRequestException(`文件大小不能超过${maxSizeMb}MB`);
    try {
      const metadata = await sharp(file.buffer).metadata();
      if (!['jpeg', 'png', 'webp', 'heif'].includes(metadata.format || '')) {
        throw new Error('unsupported image format');
      }
    } catch {
      throw new BadRequestException('图片内容无效或格式不受支持');
    }
    let res;
    if (this.isLocal) {
      res = await this.saveFileLocal(file);
    } else {
      const targetDir = this.config.get('cos.location');
      res = await this.saveFileCos(targetDir, file);
    }
    const uploadId = GenerateUUID();
    await this.sysUploadEntityRep.save({ uploadId, ...res, ext: path.extname(res.newFileName), size: file.size });
    return res;
  }

  /**
   * 获取上传任务Id
   * @returns
   */
  async getChunkUploadId() {
    const uploadId = GenerateUUID();
    return ResultData.ok({
      uploadId: uploadId,
    });
  }

  /**
   * 文件切片上传
   */
  async chunkFileUpload(file: Express.Multer.File, body: ChunkFileDto) {
    const rootPath = process.cwd();
    const baseDirPath = path.posix.join(rootPath, this.config.get('app.file.location'));
    const chunckDirPath = path.posix.join(baseDirPath, this.thunkDir, body.uploadId);
    if (!fs.existsSync(chunckDirPath)) {
      this.mkdirsSync(chunckDirPath);
    }
    const chunckFilePath = path.posix.join(chunckDirPath, `${body.uploadId}${body.fileName}@${body.index}`);
    if (fs.existsSync(chunckFilePath)) {
      return ResultData.ok();
    } else {
      fs.writeFileSync(chunckFilePath, file.buffer);
      return ResultData.ok();
    }
  }

  /**
   * 检查切片是否已上传
   * @param uploadId
   * @param index
   */
  async checkChunkFile(body) {
    const rootPath = process.cwd();
    const baseDirPath = path.posix.join(rootPath, this.config.get('app.file.location'));
    const chunckDirPath = path.posix.join(baseDirPath, this.thunkDir, body.uploadId);
    const chunckFilePath = path.posix.join(chunckDirPath, `${body.uploadId}${body.fileName}@${body.index}`);
    if (!fs.existsSync(chunckFilePath)) {
      return ResultData.fail(500, '文件不存在');
    } else {
      return ResultData.ok();
    }
  }

  /**
   * 递归创建目录 同步方法
   * @param dirname
   * @returns
   */
  mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
      return true;
    } else {
      if (this.mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
      }
    }
  }

  /**
   * 文件切片合并
   */
  async chunkMergeFile(body: ChunkMergeFileDto) {
    const { uploadId, fileName } = body;
    const rootPath = process.cwd();
    const baseDirPath = path.posix.join(rootPath, this.config.get('app.file.location'));
    const sourceFilesDir = path.posix.join(baseDirPath, this.thunkDir, uploadId);

    if (!fs.existsSync(sourceFilesDir)) {
      return ResultData.fail(500, '文件不存在');
    }

    //对文件重命名
    const newFileName = this.getNewFileName(fileName);
    const targetFile = path.posix.join(baseDirPath, newFileName);
    await this.thunkStreamMerge(sourceFilesDir, targetFile);
    //文件相对地址
    const relativeFilePath = targetFile.replace(baseDirPath, '');
    const url = this.joinUrl(this.config.get('app.file.domain'), fileName);
    const key = path.posix.join('test', relativeFilePath);
    const data = {
      fileName: key,
      newFileName: newFileName,
      url: url,
    };
    const stats = fs.statSync(targetFile);

    if (!this.isLocal) {
      this.uploadLargeFileCos(targetFile, key);
      data.url = this.joinUrl(this.config.get('cos.domain'), key);
      // 写入上传记录
      await this.sysUploadEntityRep.save({ uploadId, ...data, ext: path.extname(data.newFileName), size: stats.size, status: '0' });
      return ResultData.ok(data);
    }
    await this.sysUploadEntityRep.save({ uploadId, ...data, ext: path.extname(data.newFileName), size: stats.size });
    return ResultData.ok(data);
  }

  /**
   * 文件合并
   * @param {string} sourceFiles 源文件目录
   * @param {string} targetFile 目标文件路径
   */
  async thunkStreamMerge(sourceFilesDir, targetFile) {
    const fileList = fs
      .readdirSync(sourceFilesDir)
      .filter((file) => fs.lstatSync(path.posix.join(sourceFilesDir, file)).isFile())
      .sort((a, b) => parseInt(a.split('@')[1]) - parseInt(b.split('@')[1]))
      .map((name) => ({
        name,
        filePath: path.posix.join(sourceFilesDir, name),
      }));

    const fileWriteStream = fs.createWriteStream(targetFile);
    let onResolve: (value) => void;
    const callbackPromise = new Promise((resolve) => {
      onResolve = resolve;
    });
    this.thunkStreamMergeProgress(fileList, fileWriteStream, sourceFilesDir, onResolve);
    return callbackPromise;
  }

  /**
   * 合并每一个切片
   * @param {Array} fileList 文件数据列表
   * @param {WritableStream} fileWriteStream 最终的写入结果流
   * @param {string} sourceFilesDir 源文件目录
   */
  thunkStreamMergeProgress(fileList, fileWriteStream, sourceFilesDir, onResolve) {
    if (!fileList.length) {
      // 删除临时目录
      fs.rmdirSync(sourceFilesDir, { recursive: true });
      onResolve();
      return;
    }

    const { filePath: chunkFilePath } = fileList.shift();
    const currentReadStream = fs.createReadStream(chunkFilePath);

    // 把结果往最终的生成文件上进行拼接
    currentReadStream.pipe(fileWriteStream, { end: false });

    currentReadStream.on('end', () => {
      // 拼接完之后进入下一次循环
      this.thunkStreamMergeProgress(fileList, fileWriteStream, sourceFilesDir, onResolve);
    });
  }

  /**
   * 保存文件到本地
   * @param file
   */
  async saveFileLocal(file: Express.Multer.File) {
    const rootPath = process.cwd();
    //文件根目录
    const baseDirPath = path.posix.join(rootPath, this.config.get('app.file.location'));

    //对文件名转码
    const originalname = iconv.decode(Buffer.from(file.originalname, 'binary'), 'utf8');
    const ext = Mime.extension(file.mimetype) || 'jpg';
    //重新生成文件名加上时间戳
    const newFileName = this.getNewFileName(path.extname(originalname) ? originalname : `${originalname}.${ext}`);
    //文件路径
    const targetFile = path.posix.join(baseDirPath, newFileName);
    //文件目录
    const sourceFilesDir = path.dirname(targetFile);
    //文件相对地址
    const relativeFilePath = targetFile.replace(baseDirPath, '');

    if (!fs.existsSync(sourceFilesDir)) {
      this.mkdirsSync(sourceFilesDir);
    }
    fs.writeFileSync(targetFile, file.buffer);

    //文件服务完整路径
    const fileName = path.posix.join(this.config.get('app.file.serveRoot'), relativeFilePath);
    const url = this.joinUrl(this.config.get('app.file.domain'), fileName);
    return {
      fileName: fileName,
      newFileName: newFileName,
      url: url,
    };
  }
  /**
   * 生成新的文件名
   * @param originalname
   * @returns
   */
  getNewFileName(originalname: string): string {
    const extension = path.extname(originalname || '').toLowerCase();
    const baseName =
      path
        .basename(originalname || 'wardrobe-image', extension)
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'wardrobe-image';
    return `${baseName}_${Date.now()}_${GenerateUUID().slice(0, 8)}${extension}`;
  }

  /**
   *
   * @param targetFile
   * @param file
   * @returns
   */
  async saveFileCos(targetDir: string, file: Express.Multer.File) {
    this.assertCosConfigured();
    const originalname = iconv.decode(Buffer.from(file.originalname || '', 'binary'), 'utf8');
    const extension = path.extname(originalname) || `.${Mime.extension(file.mimetype) || 'jpg'}`;
    const newFileName = this.getNewFileName(originalname || `wardrobe-image${extension}`);
    const prefix = String(targetDir || 'jh_chat/wardrobe').replace(/^\/+|\/+$/g, '');
    const targetFile = path.posix.join(prefix, this.getShanghaiDate(), newFileName);
    await this.uploadCos(targetFile, file.buffer, file.mimetype);
    const url = this.getCosPublicUrl(targetFile);
    return {
      fileName: targetFile,
      newFileName: newFileName,
      url: url,
    };
  }

  async uploadGeneratedImage(buffer: Buffer, fileName: string, targetDir = 'jh_chat/wardrobe/outfits') {
    if (!buffer?.length) throw new BadRequestException('生成图片内容为空');
    this.assertCosConfigured();
    const safeName = this.getNewFileName(fileName.endsWith('.jpg') ? fileName : `${fileName}.jpg`);
    const targetFile = path.posix.join(targetDir.replace(/^\/+|\/+$/g, ''), this.getShanghaiDate(), safeName);
    await this.uploadCos(targetFile, buffer, 'image/jpeg');
    const result = {
      fileName: targetFile,
      newFileName: safeName,
      url: this.getCosPublicUrl(targetFile),
    };
    await this.sysUploadEntityRep.save({
      uploadId: GenerateUUID(),
      ...result,
      ext: '.jpg',
      size: buffer.length,
    });
    return result;
  }

  /**
   * 普通文件上传cos
   * @param targetFile
   * @param uploadBody
   * @returns
   */
  async uploadCos(targetFile: string, buffer: COS.UploadBody, contentType?: string) {
    try {
      await this.cos.putObject({
        Bucket: this.config.get('cos.bucket'),
        Region: this.config.get('cos.region'),
        Key: targetFile,
        Body: buffer,
        ContentType: contentType,
      });
      return targetFile;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new ServiceUnavailableException(`腾讯云 COS 上传失败：${message}`);
    }
  }

  private assertCosConfigured() {
    const secretId = String(this.config.get('cos.secretId') || '');
    const secretKey = String(this.config.get('cos.secretKey') || '');
    const bucket = String(this.config.get('cos.bucket') || '');
    const region = String(this.config.get('cos.region') || '');
    if (!secretId || !secretKey || !bucket || !region || secretId.includes('请手动修改') || secretKey.includes('请手动修改')) {
      throw new ServiceUnavailableException('腾讯云 COS 尚未配置，请先填写 cos.secretId 和 cos.secretKey');
    }
  }

  private getShanghaiDate() {
    const parts = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || '';
    return `${value('year')}${value('month')}${value('day')}`;
  }

  private getCosPublicUrl(key: string) {
    const domain = this.config.get('cos.domain');
    if (domain) return this.joinUrl(domain, key);
    const bucket = this.config.get('cos.bucket');
    const region = this.config.get('cos.region');
    return `https://${bucket}.cos.${region}.myqcloud.com/${key.split('/').map(encodeURIComponent).join('/')}`;
  }

  private joinUrl(domain: string, filePath: string) {
    return `${String(domain || '').replace(/\/+$/, '')}/${String(filePath || '').replace(/^\/+/, '')}`;
  }

  /**
   * 获取分片上传结果
   * @param uploadId
   * @returns
   */
  async getChunkUploadResult(uploadId: string) {
    const data = await this.sysUploadEntityRep.findOne({
      where: { uploadId },
      select: ['status', 'fileName', 'newFileName', 'url'],
    });

    if (data) {
      return ResultData.ok({
        data: data,
        msg: data.status === '0' ? '上传成功' : '上传中',
      });
    } else {
      return ResultData.fail(500, '文件不存在');
    }
  }

  /**
   *  大文件上传cos
   * @param sourceFile
   * @param targetFile
   * @returns
   */
  async uploadLargeFileCos(sourceFile: string, targetFile: string) {
    const { statusCode } = await this.cosHeadObject(targetFile);
    if (statusCode !== 200) {
      //不存在
      await this.cos.uploadFile({
        Bucket: this.config.get('cos.bucket'),
        Region: this.config.get('cos.region'),
        Key: targetFile,
        FilePath: sourceFile,
        SliceSize: 1024 * 1024 * 5 /* 触发分块上传的阈值，超过5MB使用分块上传，非必须 */,
        onProgress: function (progressData) {
          /* 非必须 */
          if (progressData.percent === 1) {
            this.sysUploadEntityRep.update({ filName: targetFile }, { status: 0 });
          }
        },
      });
    }
    //删除本地文件
    fs.unlinkSync(sourceFile);
    return targetFile;
  }

  /**
   * 检查cos资源是否存在
   * @param directory
   * @param key
   * @returns
   */
  async cosHeadObject(targetFile: string) {
    try {
      return await this.cos.headObject({
        Bucket: this.config.get('cos.bucket'),
        Region: this.config.get('cos.region'),
        Key: targetFile,
      });
    } catch (error) {
      return error;
    }
  }

  /**
   * 获取cos授权
   * @returns
   */
  async getAuthorization(Key: string) {
    const authorization = COS.getAuthorization({
      SecretId: this.config.get('cos.secretId'),
      SecretKey: this.config.get('cos.secretKey'),
      Method: 'post',
      Key: Key,
      Expires: 60,
    });
    return ResultData.ok({
      sign: authorization,
    });
  }
}
