import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { UploadService } from 'src/module/upload/upload.service';
import { ClothingItemEntity } from './entities/clothing-item.entity';

type RenderMeta = {
  scene: string;
  colors?: string[];
};

@Injectable()
export class OutfitRenderService {
  private readonly logger = new Logger(OutfitRenderService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly uploadService: UploadService,
  ) {}

  async render(items: ClothingItemEntity[], meta: RenderMeta) {
    const visibleItems = items.filter((item) => item.imageUrl).slice(0, 5);
    if (!visibleItems.length) throw new Error('搭配单品没有可用图片');

    const layers = await Promise.all(
      visibleItems.map(async (item, index) => {
        const slot = this.getSlot(item.category, index, visibleItems.length);
        const source = await this.downloadImage(item.imageUrl);
        const image = await sharp(source)
          .rotate()
          .trim({ background: '#ffffff', threshold: 15 })
          .resize(slot.width, slot.height, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
            withoutEnlargement: true,
          })
          .png()
          .toBuffer();
        return { input: image, left: slot.left, top: slot.top };
      }),
    );

    const accentColors = (meta.colors || []).slice(0, 4).map((value) => this.toSafeColor(value));
    const decoration = this.buildDecoration(meta.scene, accentColors);
    const buffer = await sharp({
      create: {
        width: 1080,
        height: 1350,
        channels: 4,
        background: { r: 246, g: 241, b: 233, alpha: 1 },
      },
    })
      .composite([{ input: Buffer.from(decoration), left: 0, top: 0 }, ...layers])
      .jpeg({ quality: 90, chromaSubsampling: '4:4:4' })
      .toBuffer();

    const uploaded = await this.uploadService.uploadGeneratedImage(buffer, `outfit-${Date.now()}.jpg`);
    return uploaded.url;
  }

  private async downloadImage(url: string) {
    try {
      const response = await this.httpService.axiosRef.get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
        timeout: 15000,
        maxContentLength: 12 * 1024 * 1024,
      });
      return Buffer.from(response.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`下载衣物图片失败: ${message}`);
      throw new Error(`无法读取衣物图片：${message}`);
    }
  }

  private getSlot(category: string, index: number, total: number) {
    const topLike = /上衣|外套/.test(category);
    const bottomLike = /裤装|裙装/.test(category);
    const accessory = /鞋包|配饰/.test(category);
    if (total === 1) return { left: 190, top: 215, width: 700, height: 900 };
    if (topLike) return { left: 70, top: 185, width: 560, height: 545 };
    if (bottomLike) return { left: 90, top: 650, width: 520, height: 555 };
    if (accessory) {
      const accessoryIndex = index % 2;
      return { left: 650, top: accessoryIndex ? 710 : 250, width: 355, height: 355 };
    }
    const fallback = [
      { left: 70, top: 210, width: 500, height: 480 },
      { left: 80, top: 680, width: 500, height: 500 },
      { left: 640, top: 260, width: 365, height: 365 },
      { left: 650, top: 720, width: 350, height: 350 },
      { left: 690, top: 1080, width: 260, height: 180 },
    ];
    return fallback[index] || fallback[fallback.length - 1];
  }

  private buildDecoration(scene: string, colors: string[]) {
    const swatches = (colors.length ? colors : ['#7D8C83', '#D8C6B5', '#A56D4D'])
      .map((color, index) => `<rect x="${760 + index * 58}" y="112" width="40" height="40" rx="8" fill="${color}"/>`)
      .join('');
    return `
      <svg width="1080" height="1350" xmlns="http://www.w3.org/2000/svg">
        <rect width="1080" height="1350" fill="#F6F1E9"/>
        <text x="72" y="104" font-family="Arial, sans-serif" font-size="25" font-weight="700" fill="#8A7869">WARDROBE MANAGER</text>
        <text x="72" y="153" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#1C1A17">${this.escapeXml(scene || 'DAILY LOOK')}</text>
        ${swatches}
        <line x1="72" y1="1215" x2="1008" y2="1215" stroke="#D8CDC1" stroke-width="2"/>
        <text x="72" y="1274" font-family="Arial, sans-serif" font-size="24" fill="#8A7869">REAL ITEMS · AI STYLING</text>
        <circle cx="986" cy="1265" r="22" fill="#1C1A17"/>
        <path d="M977 1265l7 7 13-16" fill="none" stroke="#F6F1E9" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }

  private toSafeColor(value: string) {
    if (/^#[0-9a-f]{6}$/i.test(value || '')) return value;
    const colorMap: Record<string, string> = {
      黑: '#2D2B2A',
      白: '#F4F0E8',
      灰: '#8B8C8D',
      蓝: '#6F8FAF',
      红: '#B95C5C',
      粉: '#D9A6AF',
      绿: '#758D78',
      黄: '#D6B565',
      紫: '#8A7395',
      米: '#D8C7AD',
      棕: '#8A6652',
      橙: '#C88455',
      银: '#B9BDC2',
      金: '#B89A5B',
    };
    const key = Object.keys(colorMap).find((name) => String(value).includes(name));
    return key ? colorMap[key] : '#B9A89A';
  }

  private escapeXml(value: string) {
    return String(value).replace(
      /[<>&'"]/g,
      (char) =>
        ({
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          "'": '&apos;',
          '"': '&quot;',
        })[char],
    );
  }
}
