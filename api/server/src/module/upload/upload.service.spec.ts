import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { UploadService } from './upload.service';

describe('UploadService', () => {
  const repository = { save: jest.fn() };
  const config = {
    get: jest.fn(
      (key: string) =>
        ({
          'app.file.isLocal': true,
          'app.file.maxSize': 2,
          'cos.secretId': '',
          'cos.secretKey': '',
        })[key],
    ),
  };
  const service = new UploadService(repository as any, config as any);

  beforeEach(() => jest.clearAllMocks());

  it('rejects files whose declared type is not an allowed image', async () => {
    const file = {
      buffer: Buffer.from('not-an-image'),
      mimetype: 'text/plain',
      size: 12,
    } as Express.Multer.File;

    await expect(service.singleFileUpload(file)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects fake image content even when the MIME type says JPEG', async () => {
    const file = {
      buffer: Buffer.from('not-an-image'),
      mimetype: 'image/jpeg',
      size: 12,
    } as Express.Multer.File;

    await expect(service.singleFileUpload(file)).rejects.toThrow('图片内容无效');
  });

  it('accepts a real supported image before storage', async () => {
    const buffer = await sharp({
      create: { width: 2, height: 2, channels: 3, background: '#ffffff' },
    })
      .jpeg()
      .toBuffer();
    const file = { buffer, mimetype: 'image/jpeg', size: buffer.length } as Express.Multer.File;
    jest.spyOn(service, 'saveFileLocal').mockResolvedValue({
      fileName: 'test.jpg',
      newFileName: 'test.jpg',
      url: 'http://localhost/test.jpg',
    });

    await expect(service.singleFileUpload(file)).resolves.toMatchObject({ url: 'http://localhost/test.jpg' });
  });
});
