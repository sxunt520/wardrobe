import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { RedisService } from 'src/module/common/redis/redis.service';
import { AliyunAiService } from './aliyun-ai.service';
import { ClothingItemEntity } from './entities/clothing-item.entity';
import { OutfitEntity } from './entities/outfit.entity';
import { StyleChallengeEntity } from './entities/style-challenge.entity';
import { WardrobeProfileEntity } from './entities/wardrobe-profile.entity';
import { AnalyzeClothingDto, ClothingQueryDto, CreateClothingDto, CreateFeedbackDto, CreateSubmissionDto, GenerateOutfitDto, ScoreChallengeDto, UpsertProfileDto, WardrobePageQueryDto } from './dto';
import { CommunitySubmissionEntity } from './entities/community-submission.entity';
import { UserFeedbackEntity } from './entities/user-feedback.entity';
import { OutfitRenderService } from './outfit-render.service';
import { AliyunTryOnService } from './aliyun-try-on.service';
import { TryOnRecordEntity } from './entities/try-on-record.entity';

@Injectable()
export class WardrobeService {
  constructor(
    @InjectRepository(WardrobeProfileEntity)
    private readonly profileRepo: Repository<WardrobeProfileEntity>,
    @InjectRepository(ClothingItemEntity)
    private readonly clothingRepo: Repository<ClothingItemEntity>,
    @InjectRepository(OutfitEntity)
    private readonly outfitRepo: Repository<OutfitEntity>,
    @InjectRepository(TryOnRecordEntity)
    private readonly tryOnRecordRepo: Repository<TryOnRecordEntity>,
    @InjectRepository(StyleChallengeEntity)
    private readonly challengeRepo: Repository<StyleChallengeEntity>,
    @InjectRepository(CommunitySubmissionEntity)
    private readonly submissionRepo: Repository<CommunitySubmissionEntity>,
    @InjectRepository(UserFeedbackEntity)
    private readonly feedbackRepo: Repository<UserFeedbackEntity>,
    private readonly ai: AliyunAiService,
    private readonly redis: RedisService,
    private readonly outfitRenderer: OutfitRenderService,
    private readonly tryOnService: AliyunTryOnService,
  ) {}

  async getProfile(userId: string) {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = await this.profileRepo.save(
        this.profileRepo.create({
          userId,
          nickname: 'Sxunt',
          height: 168,
          weight: 55,
          bodyShape: '梨形',
          skinTone: '冷暖中性',
          stylePreferences: ['极简', '通勤', '法式', '低饱和'],
          avoidColors: ['荧光色'],
          brandPreferences: [],
          isPro: 0,
        }),
      );
    }
    return this.toProfileDto(profile);
  }

  async upsertProfile(userId: string, dto: UpsertProfileDto) {
    const current = await this.profileRepo.findOne({ where: { userId } });
    const profile = this.profileRepo.merge(current || this.profileRepo.create(), {
      ...dto,
      userId,
      isPro: current?.isPro || 0,
    });
    return this.toProfileDto(await this.profileRepo.save(profile));
  }

  async listClothing(userId: string, query: ClothingQueryDto) {
    const where: Record<string, any> = { userId, delFlag: '0' };
    if (query.category && query.category !== '全部') where.category = query.category;
    if (query.color) where.color = Like(`%${query.color}%`);
    if (query.season) where.season = query.season;
    if (query.isFrequent === 'true') where.isFrequent = 1;
    if (query.pageNum || query.pageSize) {
      const pageNum = Math.max(Number(query.pageNum || 1), 1);
      const pageSize = Math.min(Math.max(Number(query.pageSize || 20), 1), 100);
      const [items, total] = await this.clothingRepo.findAndCount({
        where,
        order: { createTime: 'DESC' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      });
      return { list: items.map((item) => this.toClothingDto(item)), total, pageNum, pageSize };
    }
    const items = await this.clothingRepo.find({ where, order: { createTime: 'DESC' } });
    return items.map((item) => this.toClothingDto(item));
  }

  async createClothing(userId: string, dto: CreateClothingDto) {
    this.assertRemoteImageUrl(dto.imageUrl);
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile?.isPro) {
      const itemCount = await this.clothingRepo.count({ where: { userId, delFlag: '0' } });
      if (itemCount >= 30) throw new BadRequestException('免费版衣橱最多保存 30 件衣物');
    }
    const item = await this.clothingRepo.save(
      this.clothingRepo.create({
        ...dto,
        userId,
        color: dto.color || '',
        texture: dto.texture || '',
        brand: dto.brand || '',
        season: dto.season || '四季',
        imageUrl: dto.imageUrl || '',
        tags: dto.tags || [],
        isFavorite: dto.isFavorite ? 1 : 0,
        isFrequent: dto.isFrequent ? 1 : 0,
        aiConfidence: 92,
      }),
    );
    await this.redis.del(`wardrobe:stats:${userId}`);
    return this.toClothingDto(item);
  }

  async updateClothing(userId: string, id: string, dto: Partial<CreateClothingDto>) {
    this.assertRemoteImageUrl(dto.imageUrl);
    const item = await this.clothingRepo.findOne({ where: { clothingId: id, userId, delFlag: '0' } });
    if (!item) throw new NotFoundException('衣物不存在');
    const next = this.clothingRepo.merge(item, {
      ...dto,
      isFavorite: typeof dto.isFavorite === 'boolean' ? (dto.isFavorite ? 1 : 0) : item.isFavorite,
      isFrequent: typeof dto.isFrequent === 'boolean' ? (dto.isFrequent ? 1 : 0) : item.isFrequent,
    });
    await this.redis.del(`wardrobe:stats:${item.userId}`);
    return this.toClothingDto(await this.clothingRepo.save(next));
  }

  async deleteClothing(userId: string, id: string) {
    const item = await this.clothingRepo.findOne({ where: { clothingId: id, userId, delFlag: '0' } });
    if (!item) return { success: true };
    item.delFlag = '1';
    await this.clothingRepo.save(item);
    await this.redis.del(`wardrobe:stats:${item.userId}`);
    return { success: true };
  }

  async analyzeClothing(dto: AnalyzeClothingDto) {
    this.assertRemoteImageUrl(dto.imageUrl, true);
    const result = await this.ai.analyzeImageJson<any>(
      dto.imageUrl,
      `判断图片中是否有清晰、完整、可穿戴的真实衣物。若没有真实衣物或图片模糊、主体不完整，只返回 {"recognized":false,"errorMessage":"具体原因"}。识别成功返回字段 recognized=true, name, category, color, texture, brand, season, tags, confidence。category 必须是 上衣/裤装/裙装/外套/鞋包/配饰 之一；color 返回中文主色；confidence 返回 0-100 的整数。提示：${dto.hint || '无'}`,
    );
    if (!result.success || !result.data) {
      throw new BadRequestException(result.errorMessage || 'AI 识别失败，请重新上传清晰、完整的真实衣物图片');
    }
    if (result.data.recognized === false || !result.data.name || !result.data.category) {
      throw new BadRequestException(result.data.errorMessage || '未识别到明确衣物，请重新上传清晰、完整的真实衣物图片');
    }
    return result.data;
  }

  async generateOutfits(userId: string, dto: GenerateOutfitDto) {
    const where: Record<string, any> = { userId, delFlag: '0' };
    if (dto.clothingIds?.length) where.clothingId = In(dto.clothingIds);
    const items = await this.clothingRepo.find({ where, take: 50, order: { isFrequent: 'DESC', createTime: 'DESC' } });
    if (items.length === 0) {
      throw new BadRequestException('请先录入至少一件衣物');
    }

    const fallback = this.localOutfits(items, dto);
    const result = await this.ai.chatJson(
      [
        { role: 'system', content: '你是「衣橱管家」AI每日穿搭规划师。只返回 JSON: {outfits:[{scene,title,reason,score,clothingIds,pieces,colors,weather}]}。推荐 3 套完整搭配，理由要自然、简洁。' },
        {
          role: 'user',
          content: JSON.stringify({ scene: dto.scene || '通勤', weather: dto.weather || '多云', temperature: dto.temperature || 23, items: items.map((item) => this.toClothingDto(item)) }),
        },
      ],
      { outfits: fallback },
    );

    const outfits = (result as any).outfits?.slice(0, 5) || fallback;
    const itemMap = new Map(items.map((item) => [item.clothingId, item]));
    const saved = await Promise.all(
      outfits.map(async (outfit) => {
        const clothingIds = (outfit.clothingIds || []).filter((id) => itemMap.has(id));
        const selectedItems = clothingIds.map((id) => itemMap.get(id)).filter(Boolean) as ClothingItemEntity[];
        const renderItems = selectedItems.length ? selectedItems : items.slice(0, 4);
        let previewImageUrl = '';
        let renderStatus = 'succeeded';
        let renderError = '';
        try {
          previewImageUrl = await this.outfitRenderer.render(renderItems, {
            scene: outfit.scene || dto.scene || '日常',
            colors: outfit.colors || [],
          });
        } catch (error) {
          renderStatus = 'failed';
          renderError = error instanceof Error ? error.message : String(error);
        }
        return this.outfitRepo.save(
          this.outfitRepo.create({
            userId,
            scene: outfit.scene,
            title: outfit.title,
            reason: outfit.reason,
            score: outfit.score,
            clothingIds: clothingIds.length ? clothingIds : renderItems.map((item) => item.clothingId),
            pieces: outfit.pieces || renderItems.map((item) => item.name),
            colors: outfit.colors || renderItems.map((item) => item.color).filter(Boolean),
            weather: outfit.weather || `${dto.temperature || 23}℃ ${dto.weather || '多云'}`,
            previewImageUrl,
            renderStatus,
            renderError,
          }),
        );
      }),
    );
    return saved.map((outfit) => this.toOutfitDto(outfit));
  }

  async history(userId: string, query: WardrobePageQueryDto = {}) {
    if (query.pageNum || query.pageSize) {
      const pageNum = Math.max(Number(query.pageNum || 1), 1);
      const pageSize = Math.min(Math.max(Number(query.pageSize || 20), 1), 100);
      const [outfits, total] = await this.outfitRepo.findAndCount({
        where: { userId, delFlag: '0' },
        order: { createTime: 'DESC' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      });
      return { list: outfits.map((outfit) => this.toOutfitDto(outfit)), total, pageNum, pageSize };
    }
    const outfits = await this.outfitRepo.find({ where: { userId, delFlag: '0' }, order: { createTime: 'DESC' }, take: 30 });
    return outfits.map((outfit) => this.toOutfitDto(outfit));
  }

  async getOutfit(userId: string, id: string) {
    const outfit = await this.outfitRepo.findOne({ where: { outfitId: id, userId, delFlag: '0' } });
    if (!outfit) throw new NotFoundException('搭配记录不存在');
    const clothing = outfit.clothingIds?.length ? await this.clothingRepo.find({ where: { clothingId: In(outfit.clothingIds), userId, delFlag: '0' } }) : [];
    return {
      ...this.toOutfitDto(outfit),
      items: clothing.map((item) => this.toClothingDto(item)),
    };
  }

  async saveOutfit(userId: string, id: string, isSaved: boolean) {
    const outfit = await this.outfitRepo.findOne({ where: { outfitId: id, userId, delFlag: '0' } });
    if (!outfit) throw new NotFoundException('搭配记录不存在');
    outfit.isSaved = isSaved ? 1 : 0;
    return this.toOutfitDto(await this.outfitRepo.save(outfit));
  }

  async deleteOutfit(userId: string, id: string) {
    const outfit = await this.outfitRepo.findOne({ where: { outfitId: id, userId, delFlag: '0' } });
    if (!outfit) return { success: true };
    outfit.delFlag = '1';
    await this.outfitRepo.save(outfit);
    return { success: true };
  }

  async renderOutfit(userId: string, id: string) {
    const outfit = await this.outfitRepo.findOne({ where: { outfitId: id, userId, delFlag: '0' } });
    if (!outfit) throw new NotFoundException('搭配记录不存在');
    const clothing = outfit.clothingIds?.length ? await this.clothingRepo.find({ where: { clothingId: In(outfit.clothingIds), userId, delFlag: '0' } }) : [];
    if (!clothing.length) throw new BadRequestException('搭配中没有可生成效果图的衣物');
    outfit.renderStatus = 'processing';
    outfit.renderError = '';
    await this.outfitRepo.save(outfit);
    try {
      outfit.previewImageUrl = await this.outfitRenderer.render(clothing, {
        scene: outfit.scene,
        colors: outfit.colors || [],
      });
      outfit.renderStatus = 'succeeded';
    } catch (error) {
      outfit.renderStatus = 'failed';
      outfit.renderError = error instanceof Error ? error.message : String(error);
    }
    return this.toOutfitDto(await this.outfitRepo.save(outfit));
  }

  async startTryOn(userId: string, id: string, personImageUrl: string) {
    this.assertRemoteImageUrl(personImageUrl, true);
    const outfit = await this.outfitRepo.findOne({ where: { outfitId: id, userId, delFlag: '0' } });
    if (!outfit) throw new NotFoundException('搭配记录不存在');
    const clothing = outfit.clothingIds?.length ? await this.clothingRepo.find({ where: { clothingId: In(outfit.clothingIds), userId, delFlag: '0' } }) : [];
    const top = clothing.find((item) => /上衣|外套|裙装/.test(item.category) && item.imageUrl);
    const bottom = clothing.find((item) => /裤装/.test(item.category) && item.imageUrl);
    if (!top && !bottom) throw new BadRequestException('当前搭配没有可用于真人试穿的上装、下装或裙装');
    const bottomGarmentUrl = /裙装/.test(top?.category || '') ? '' : bottom?.imageUrl || '';
    const record = await this.tryOnRecordRepo.save(
      this.tryOnRecordRepo.create({
        userId,
        outfitId: outfit.outfitId,
        outfitTitle: outfit.title,
        scene: outfit.scene,
        clothingIds: outfit.clothingIds || [],
        personImageUrl,
        topGarmentUrl: top?.imageUrl || '',
        bottomGarmentUrl,
        resultImageUrl: '',
        taskId: '',
        tryOnStatus: 'submitting',
        errorMessage: '',
      }),
    );

    outfit.tryOnPersonUrl = personImageUrl;
    outfit.tryOnImageUrl = '';
    outfit.tryOnStatus = 'submitting';
    outfit.tryOnError = '';
    outfit.tryOnTaskId = '';
    await this.outfitRepo.save(outfit);
    try {
      const task = await this.tryOnService.createTask({
        personImageUrl,
        topGarmentUrl: top?.imageUrl,
        bottomGarmentUrl: bottomGarmentUrl || undefined,
      });
      outfit.tryOnTaskId = task.taskId;
      outfit.tryOnStatus = 'processing';
      record.taskId = task.taskId;
      record.tryOnStatus = 'processing';
    } catch (error) {
      outfit.tryOnStatus = 'failed';
      outfit.tryOnError = error?.response?.data?.message || (error instanceof Error ? error.message : String(error));
      record.tryOnStatus = 'failed';
      record.errorMessage = outfit.tryOnError;
    }
    await this.tryOnRecordRepo.save(record);
    return { ...this.toOutfitDto(await this.outfitRepo.save(outfit)), tryOnRecordId: record.recordId };
  }

  async getTryOnStatus(userId: string, id: string) {
    const outfit = await this.outfitRepo.findOne({ where: { outfitId: id, userId, delFlag: '0' } });
    if (!outfit) throw new NotFoundException('搭配记录不存在');
    const record = await this.tryOnRecordRepo.findOne({
      where: { outfitId: id, userId, delFlag: '0' },
      order: { createTime: 'DESC' },
    });
    if (!outfit.tryOnTaskId || !['processing', 'submitting'].includes(outfit.tryOnStatus)) {
      return { ...this.toOutfitDto(outfit), tryOnRecordId: record?.recordId || '' };
    }
    try {
      const task = await this.tryOnService.queryTask(outfit.tryOnTaskId);
      if (task.status === 'SUCCEEDED' && task.imageUrl) {
        const persisted = await this.tryOnService.persistResult(task.imageUrl);
        outfit.tryOnImageUrl = persisted.url;
        outfit.tryOnStatus = 'succeeded';
        outfit.tryOnError = '';
        if (record) {
          record.resultImageUrl = persisted.url;
          record.tryOnStatus = 'succeeded';
          record.errorMessage = '';
        }
      } else if (task.status === 'FAILED' || task.status === 'CANCELED' || task.status === 'UNKNOWN') {
        outfit.tryOnStatus = 'failed';
        outfit.tryOnError = task.errorMessage || task.code || '真人试穿生成失败，请重新上传清晰的全身照';
        if (record) {
          record.tryOnStatus = 'failed';
          record.errorMessage = outfit.tryOnError;
        }
      } else {
        outfit.tryOnStatus = 'processing';
        if (record) record.tryOnStatus = 'processing';
      }
    } catch (error) {
      outfit.tryOnError = error?.response?.data?.message || (error instanceof Error ? error.message : String(error));
      if (record) record.errorMessage = outfit.tryOnError;
    }
    if (record) await this.tryOnRecordRepo.save(record);
    return { ...this.toOutfitDto(await this.outfitRepo.save(outfit)), tryOnRecordId: record?.recordId || '' };
  }

  async listTryOnHistory(userId: string, query: WardrobePageQueryDto = {}) {
    if (query.pageNum || query.pageSize) {
      const pageNum = Math.max(Number(query.pageNum || 1), 1);
      const pageSize = Math.min(Math.max(Number(query.pageSize || 20), 1), 100);
      const [records, total] = await this.tryOnRecordRepo.findAndCount({
        where: { userId, delFlag: '0' },
        order: { createTime: 'DESC' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      });
      return { list: records.map((record) => this.toTryOnRecordDto(record)), total, pageNum, pageSize };
    }
    const records = await this.tryOnRecordRepo.find({
      where: { userId, delFlag: '0' },
      order: { createTime: 'DESC' },
      take: 100,
    });
    return records.map((record) => this.toTryOnRecordDto(record));
  }

  async getTryOnHistory(userId: string, id: string) {
    const record = await this.tryOnRecordRepo.findOne({ where: { recordId: id, userId, delFlag: '0' } });
    if (!record) throw new NotFoundException('试穿记录不存在');
    return this.toTryOnRecordDto(record);
  }

  async deleteTryOnHistory(userId: string, id: string) {
    const record = await this.tryOnRecordRepo.findOne({ where: { recordId: id, userId, delFlag: '0' } });
    if (!record) return { success: true };
    record.delFlag = '1';
    await this.tryOnRecordRepo.save(record);
    return { success: true };
  }

  async explore() {
    await this.seedChallenges();
    const challenges = await this.challengeRepo.find({ where: { delFlag: '0' }, order: { createTime: 'DESC' }, take: 10 });
    const popularOutfits = [
      { id: 'rank-1', name: 'Mia', scene: '约会', score: 98, reason: '暖粉与摩卡色相邻，材质对比轻盈，适合傍晚光线。' },
      { id: 'rank-2', name: 'Chen', scene: '通勤', score: 95, reason: '黑白灰控制得干净，银色配饰增加精致度。' },
      { id: 'rank-3', name: 'Luna', scene: '运动', score: 93, reason: '高明度蓝绿色拉开层次，鞋包呼应让视觉更完整。' },
    ];
    return {
      challenges: challenges.map((item) => ({
        id: item.challengeId,
        tag: item.tag,
        title: item.title,
        reward: item.reward,
        participants: item.participants,
        colors: item.colors || [],
      })),
      popularOutfits,
    };
  }

  async scoreChallenge(userId: string, dto: ScoreChallengeDto) {
    const fallback = {
      score: 88,
      colorHarmony: 86,
      styleMatch: 90,
      comment: '色彩关系稳定，风格主题明确。建议加入一个小面积亮色配饰提升记忆点。',
    };
    return await this.ai.chatJson(
      [
        { role: 'system', content: '你是穿搭挑战评分助手，只返回 JSON: score, colorHarmony, styleMatch, comment。' },
        { role: 'user', content: JSON.stringify({ ...dto, userId }) },
      ],
      fallback,
    );
  }

  async createSubmission(userId: string, dto: CreateSubmissionDto) {
    return this.submissionRepo.save(
      this.submissionRepo.create({
        userId,
        challengeId: dto.challengeId || '',
        title: dto.title,
        imageUrl: dto.imageUrl,
        content: dto.content || '',
        auditStatus: '0',
      }),
    );
  }

  async createFeedback(userId: string, dto: CreateFeedbackDto) {
    return this.feedbackRepo.save(
      this.feedbackRepo.create({
        userId,
        feedbackType: dto.feedbackType || '建议',
        title: dto.title,
        content: dto.content,
        contact: dto.contact || '',
        handleStatus: '0',
      }),
    );
  }

  async report(userId: string) {
    const cacheKey = `wardrobe:stats:${userId}`;
    const cached = await this.redis.get(cacheKey).catch(() => null);
    if (cached) return cached;

    const items = await this.clothingRepo.find({ where: { userId, delFlag: '0' } });
    const colorMap = items.reduce<Record<string, number>>((map, item) => {
      const color = item.color || '未知';
      map[color] = (map[color] || 0) + 1;
      return map;
    }, {});
    const missing = items.some((item) => item.category === '裤装' && /黑|深|灰/.test(item.color)) ? ['低跟短靴'] : ['深色直筒裤', '低跟短靴'];
    const report = {
      totalItems: items.length,
      frequentItems: items.filter((item) => item.isFrequent).length,
      favoriteItems: items.filter((item) => item.isFavorite).length,
      colorUsage: colorMap,
      missingItems: missing,
      suggestion: `你的衣橱缺少${missing.join('、')}，优先补入可提升通勤和出差场景复用率。`,
    };
    await this.redis.set(cacheKey, report, 1000 * 60 * 10).catch(() => null);
    return report;
  }

  private localOutfits(items: ClothingItemEntity[], dto: GenerateOutfitDto) {
    const tops = items.filter((item) => item.category.includes('上衣'));
    const bottoms = items.filter((item) => item.category.includes('裤') || item.category.includes('裙'));
    const coats = items.filter((item) => item.category.includes('外套'));
    const shoes = items.filter((item) => item.category.includes('鞋') || item.category.includes('包'));
    const scenes = [dto.scene || '通勤', '约会', '出差'];
    return scenes.map((scene, index) => {
      const selected = [
        tops[index % Math.max(tops.length, 1)],
        bottoms[index % Math.max(bottoms.length, 1)],
        coats[index % Math.max(coats.length, 1)],
        shoes[index % Math.max(shoes.length, 1)],
      ].filter(Boolean);
      return {
        id: `local-${index + 1}`,
        scene,
        title:
          selected
            .map((item) => item.name)
            .slice(0, 2)
            .join(' + ') || '基础胶囊搭配',
        reason: `${selected
          .map((item) => item.color)
          .filter(Boolean)
          .join('、')}的组合稳定耐看，适合${dto.temperature || 23}℃ ${dto.weather || '多云'}天气。`,
        score: 96 - index * 3,
        clothingIds: selected.map((item) => item.clothingId),
        pieces: selected.map((item) => item.name),
        colors: selected.map((item) => item.color).filter(Boolean),
        weather: `${dto.temperature || 23}℃ ${dto.weather || '多云'}`,
      };
    });
  }

  private async seedChallenges() {
    const count = await this.challengeRepo.count();
    if (count > 0) return;
    await this.challengeRepo.save([
      this.challengeRepo.create({ tag: '#复古波点', title: '用一件复古元素点亮今天', reward: '+120 风格积分', participants: 2800, colors: ['#191815', '#F5EFE6', '#B5483D'] }),
      this.challengeRepo.create({ tag: '#轻通勤', title: '5 分钟出门的清爽办公室穿搭', reward: '+80 风格积分', participants: 1400, colors: ['#7EA7C8', '#D8C8AA', '#EEE6DC'] }),
      this.challengeRepo.create({ tag: '#周末短途', title: '一套覆盖拍照和步行的出游装', reward: '+100 风格积分', participants: 956, colors: ['#56677B', '#A56D4D', '#F7F1E8'] }),
    ]);
  }

  private toProfileDto(profile: WardrobeProfileEntity) {
    return { id: profile.profileId, ...profile, isPro: profile.isPro === 1 };
  }

  private toClothingDto(item: ClothingItemEntity) {
    return {
      id: item.clothingId,
      userId: item.userId,
      name: item.name,
      category: item.category,
      color: item.color,
      texture: item.texture,
      brand: item.brand,
      season: item.season,
      imageUrl: item.imageUrl,
      tags: item.tags || [],
      isFavorite: item.isFavorite === 1,
      isFrequent: item.isFrequent === 1,
      confidence: item.aiConfidence,
      createdAt: item.createTime,
    };
  }

  private toOutfitDto(outfit: OutfitEntity) {
    return {
      id: outfit.outfitId,
      scene: outfit.scene,
      title: outfit.title,
      reason: outfit.reason,
      score: outfit.score,
      clothingIds: outfit.clothingIds || [],
      pieces: outfit.pieces || [],
      colors: outfit.colors || [],
      weather: outfit.weather,
      isSaved: outfit.isSaved === 1,
      imageUrl: outfit.previewImageUrl,
      previewImageUrl: outfit.previewImageUrl,
      renderStatus: outfit.renderStatus,
      renderError: outfit.renderError,
      tryOnPersonUrl: outfit.tryOnPersonUrl,
      tryOnImageUrl: outfit.tryOnImageUrl,
      tryOnTaskId: outfit.tryOnTaskId,
      tryOnStatus: outfit.tryOnStatus,
      tryOnError: outfit.tryOnError,
      createdAt: outfit.createTime,
    };
  }

  private toTryOnRecordDto(record: TryOnRecordEntity) {
    return {
      id: record.recordId,
      outfitId: record.outfitId,
      outfitTitle: record.outfitTitle,
      scene: record.scene,
      clothingIds: record.clothingIds || [],
      personImageUrl: record.personImageUrl,
      topGarmentUrl: record.topGarmentUrl,
      bottomGarmentUrl: record.bottomGarmentUrl,
      resultImageUrl: record.resultImageUrl,
      taskId: record.taskId,
      status: record.tryOnStatus,
      errorMessage: record.errorMessage,
      createdAt: record.createTime,
      updatedAt: record.updateTime,
    };
  }

  private assertRemoteImageUrl(imageUrl?: string, required = false) {
    if (!imageUrl && !required) return;
    if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
      throw new BadRequestException('图片必须先上传到腾讯云 COS，再使用返回的 HTTPS 地址');
    }
  }
}
