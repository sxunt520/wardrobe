import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import fs from 'fs';
import path from 'path';
import Mime from 'mime-types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiCallLogEntity } from './entities/ai-call-log.entity';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content:
    | string
    | Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: { url: string };
      }>;
};

export type VisionAnalysisResult<T> = {
  data?: T;
  success: boolean;
  errorMessage?: string;
};

@Injectable()
export class AliyunAiService {
  private readonly logger = new Logger(AliyunAiService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(AiCallLogEntity)
    private readonly aiLogRepo: Repository<AiCallLogEntity>,
  ) {}

  async chatJson<T>(messages: ChatMessage[], fallback: T): Promise<T> {
    const startedAt = Date.now();
    const apiKey = this.config.get<string>('aliyun.dashscope.apiKey') || process.env.DASHSCOPE_API_KEY || process.env.ALIYUN_DASHSCOPE_API_KEY;
    const model = this.config.get<string>('aliyun.dashscope.model') || process.env.DASHSCOPE_MODEL || 'qwen-plus';
    const baseUrl = this.config.get<string>('aliyun.dashscope.baseUrl') || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

    if (!apiKey) {
      const message = 'DashScope API Key 尚未配置';
      await this.writeLog('text', model, '2', Date.now() - startedAt, message);
      if (this.allowFallback()) {
        this.logger.warn(`${message}，已按配置使用规则回退`);
        return fallback;
      }
      throw new ServiceUnavailableException(message);
    }

    try {
      const response = await this.httpService.axiosRef.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.4,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        },
      );
      const raw = response.data?.choices?.[0]?.message?.content;
      await this.writeLog('text', model, '0', Date.now() - startedAt);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      const message = error?.response?.data?.error?.message || error?.message || String(error);
      await this.writeLog('text', model, '1', Date.now() - startedAt, message);
      if (this.allowFallback()) {
        this.logger.warn(`DashScope 调用失败，已按配置使用规则回退: ${message}`);
        return fallback;
      }
      throw new ServiceUnavailableException(`AI 服务调用失败：${message}`);
    }
  }

  async analyzeImageJson<T>(imageUrl: string, prompt: string): Promise<VisionAnalysisResult<T>> {
    const imageContent = await this.resolveImageContent(imageUrl);
    const visualModel = this.config.get<string>('aliyun.dashscope.visualModel') || process.env.DASHSCOPE_VISUAL_MODEL || 'qwen-vl-plus';

    return this.chatJsonWithModel<T>(
      [
        { role: 'system', content: '你是专业服装识别助手，只返回合法 JSON，不要输出 Markdown。' },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageContent } },
            { type: 'text', text: prompt },
          ],
        },
      ],
      visualModel,
    );
  }

  private async chatJsonWithModel<T>(messages: ChatMessage[], model: string): Promise<VisionAnalysisResult<T>> {
    const startedAt = Date.now();
    const apiKey = this.config.get<string>('aliyun.dashscope.apiKey') || process.env.DASHSCOPE_API_KEY || process.env.ALIYUN_DASHSCOPE_API_KEY;
    const baseUrl = this.config.get<string>('aliyun.dashscope.baseUrl') || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    if (!apiKey) {
      const errorMessage = 'AI 识别服务尚未配置，请联系管理员';
      await this.writeLog('vision', model, '2', Date.now() - startedAt, errorMessage);
      return { success: false, errorMessage };
    }

    try {
      const response = await this.httpService.axiosRef.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.2,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );
      const raw = response.data?.choices?.[0]?.message?.content;
      if (!raw) throw new Error('AI 未返回识别内容');
      const data = JSON.parse(raw) as T;
      await this.writeLog('vision', model, '0', Date.now() - startedAt);
      return { success: true, data };
    } catch (error) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || String(error);
      this.logger.warn(`DashScope 视觉模型调用失败: ${errorMessage}`);
      await this.writeLog('vision', model, '1', Date.now() - startedAt, errorMessage);
      return { success: false, errorMessage: `AI 识别失败：${errorMessage}` };
    }
  }

  private async resolveImageContent(imageUrl: string): Promise<string> {
    try {
      const parsed = new URL(imageUrl);
      const serveRoot = this.config.get<string>('app.file.serveRoot') || '/profile';
      if (parsed.pathname.startsWith(serveRoot)) {
        const relativePath = decodeURIComponent(parsed.pathname.slice(serveRoot.length)).replace(/^\/+/, '');
        const baseDir = path.resolve(process.cwd(), this.config.get<string>('app.file.location'));
        const filePath = path.resolve(baseDir, relativePath);
        if (filePath.startsWith(baseDir) && fs.existsSync(filePath)) {
          const mimeType = Mime.lookup(filePath) || 'image/jpeg';
          return `data:${mimeType};base64,${fs.readFileSync(filePath).toString('base64')}`;
        }
      }
    } catch (error) {
      this.logger.debug(`图片地址按远程 URL 处理: ${error?.message || error}`);
    }
    return imageUrl;
  }

  private async writeLog(scene: string, model: string, callStatus: string, durationMs: number, errorMessage = '') {
    try {
      await this.aiLogRepo.save(this.aiLogRepo.create({ scene, model, callStatus, durationMs, errorMessage }));
    } catch (error) {
      this.logger.debug(`AI 日志写入失败: ${error?.message || error}`);
    }
  }

  private allowFallback() {
    return this.config.get<boolean>('aliyun.dashscope.allowFallback') === true;
  }
}
