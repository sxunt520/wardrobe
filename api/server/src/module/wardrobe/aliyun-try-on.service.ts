import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import { UploadService } from 'src/module/upload/upload.service';

type TryOnInput = {
  personImageUrl: string;
  topGarmentUrl?: string;
  bottomGarmentUrl?: string;
};

@Injectable()
export class AliyunTryOnService {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
    private readonly uploadService: UploadService,
  ) {}

  async createTask(input: TryOnInput) {
    const apiKey = this.apiKey();
    const model = this.config.get<string>('aliyun.dashscope.tryOnModel') || 'aitryon-plus';
    const response = await this.httpService.axiosRef.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis',
      {
        model,
        input: {
          person_image_url: input.personImageUrl,
          ...(input.topGarmentUrl ? { top_garment_url: input.topGarmentUrl } : {}),
          ...(input.bottomGarmentUrl ? { bottom_garment_url: input.bottomGarmentUrl } : {}),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable',
        },
        timeout: 30000,
      },
    );
    const taskId = response.data?.output?.task_id;
    if (!taskId) throw new Error(response.data?.message || '阿里云未返回试穿任务 ID');
    return { taskId, status: response.data?.output?.task_status || 'PENDING', model };
  }

  async queryTask(taskId: string) {
    const response = await this.httpService.axiosRef.get(`https://dashscope.aliyuncs.com/api/v1/tasks/${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${this.apiKey()}` },
      timeout: 30000,
    });
    const output = response.data?.output || {};
    return {
      status: String(output.task_status || 'UNKNOWN').toUpperCase(),
      imageUrl: output.image_url || '',
      errorMessage: output.message || response.data?.message || '',
      code: output.code || response.data?.code || '',
    };
  }

  async persistResult(remoteUrl: string) {
    const response = await this.httpService.axiosRef.get<ArrayBuffer>(remoteUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      maxContentLength: 8 * 1024 * 1024,
    });
    const jpeg = await sharp(Buffer.from(response.data)).rotate().resize({ width: 1280, height: 1920, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 91 }).toBuffer();
    return this.uploadService.uploadGeneratedImage(jpeg, `try-on-${Date.now()}.jpg`, 'jh_chat/wardrobe/try-on');
  }

  private apiKey() {
    const apiKey = this.config.get<string>('aliyun.dashscope.apiKey') || process.env.DASHSCOPE_API_KEY;
    if (!apiKey) throw new Error('阿里云 AI 试衣 API Key 尚未配置');
    return apiKey;
  }
}
