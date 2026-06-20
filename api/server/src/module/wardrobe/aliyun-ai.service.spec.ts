import { ServiceUnavailableException } from '@nestjs/common';
import { AliyunAiService } from './aliyun-ai.service';

describe('AliyunAiService', () => {
  const httpService = { axiosRef: { post: jest.fn() } };
  const logRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => value),
  };

  const createService = (allowFallback: boolean) =>
    new AliyunAiService(
      {
        get: jest.fn(
          (key: string) =>
            ({
              'aliyun.dashscope.apiKey': '',
              'aliyun.dashscope.model': 'qwen-plus',
              'aliyun.dashscope.baseUrl': 'https://example.invalid',
              'aliyun.dashscope.allowFallback': allowFallback,
            })[key],
        ),
      } as any,
      httpService as any,
      logRepository as any,
    );

  beforeEach(() => jest.clearAllMocks());

  it('fails explicitly when the API key is missing and fallback is disabled', async () => {
    await expect(createService(false).chatJson([], { ok: false })).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('uses fallback only when it is explicitly enabled', async () => {
    await expect(createService(true).chatJson([], { ok: true })).resolves.toEqual({ ok: true });
  });
});
