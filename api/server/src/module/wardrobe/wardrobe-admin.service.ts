import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { UserEntity } from 'src/module/system/user/entities/sys-user.entity';
import { WardrobeAdminQueryDto } from './dto/admin';
import { ClothingItemEntity } from './entities/clothing-item.entity';
import { OutfitEntity } from './entities/outfit.entity';
import { StyleChallengeEntity } from './entities/style-challenge.entity';
import { WardrobeProfileEntity } from './entities/wardrobe-profile.entity';
import { CommunitySubmissionEntity } from './entities/community-submission.entity';
import { AiCallLogEntity } from './entities/ai-call-log.entity';
import { UserFeedbackEntity } from './entities/user-feedback.entity';
import { UserMembershipEntity } from './entities/user-membership.entity';

@Injectable()
export class WardrobeAdminService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(ClothingItemEntity) private readonly clothingRepo: Repository<ClothingItemEntity>,
    @InjectRepository(OutfitEntity) private readonly outfitRepo: Repository<OutfitEntity>,
    @InjectRepository(StyleChallengeEntity) private readonly challengeRepo: Repository<StyleChallengeEntity>,
    @InjectRepository(WardrobeProfileEntity) private readonly profileRepo: Repository<WardrobeProfileEntity>,
    @InjectRepository(CommunitySubmissionEntity) private readonly submissionRepo: Repository<CommunitySubmissionEntity>,
    @InjectRepository(AiCallLogEntity) private readonly aiLogRepo: Repository<AiCallLogEntity>,
    @InjectRepository(UserFeedbackEntity) private readonly feedbackRepo: Repository<UserFeedbackEntity>,
    @InjectRepository(UserMembershipEntity) private readonly membershipRepo: Repository<UserMembershipEntity>,
  ) {}

  async overview() {
    const [users, clothing, outfits, pendingSubmissions, failedAi, pendingFeedback, proMembers] = await Promise.all([
      this.userRepo.count({ where: { userType: '10', delFlag: '0' } }),
      this.clothingRepo.count({ where: { delFlag: '0' } }),
      this.outfitRepo.count({ where: { delFlag: '0' } }),
      this.submissionRepo.count({ where: { auditStatus: '0', delFlag: '0' } }),
      this.aiLogRepo.count({ where: { callStatus: '1', delFlag: '0' } }),
      this.feedbackRepo.count({ where: { handleStatus: '0', delFlag: '0' } }),
      this.membershipRepo.count({ where: { planCode: 'pro', memberStatus: '0', delFlag: '0' } }),
    ]);
    return ResultData.ok({ users, clothing, outfits, pendingSubmissions, failedAi, pendingFeedback, proMembers });
  }

  listUsers(query: WardrobeAdminQueryDto) {
    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoin(WardrobeProfileEntity, 'p', 'CAST(p.user_id AS UNSIGNED) = u.user_id AND p.del_flag = :normal', { normal: '0' })
      .leftJoin(UserMembershipEntity, 'm', 'CAST(m.user_id AS UNSIGNED) = u.user_id AND m.del_flag = :normal', { normal: '0' })
      .leftJoin(ClothingItemEntity, 'c', 'CAST(c.user_id AS UNSIGNED) = u.user_id AND c.del_flag = :normal', { normal: '0' })
      .select(['u.userId AS userId', 'u.userName AS userName', 'u.nickName AS nickName', 'u.email AS email', 'u.status AS status', 'u.createTime AS createTime'])
      .addSelect('MAX(p.body_shape)', 'bodyShape')
      .addSelect('MAX(p.skin_tone)', 'skinTone')
      .addSelect('COALESCE(MAX(m.plan_code), "free")', 'planCode')
      .addSelect('MAX(m.expire_time)', 'expireTime')
      .addSelect('COUNT(c.clothing_id)', 'clothingCount')
      .where('u.user_type = :type AND u.del_flag = :normal', { type: '10', normal: '0' })
      .groupBy('u.user_id');
    if (query.keyword) qb.andWhere('(u.user_name LIKE :kw OR u.nick_name LIKE :kw OR u.email LIKE :kw)', { kw: `%${query.keyword}%` });
    return this.pageRaw(qb, query);
  }

  listClothing(query: WardrobeAdminQueryDto) {
    const qb = this.clothingRepo
      .createQueryBuilder('c')
      .leftJoin(UserEntity, 'u', 'u.user_id = CAST(c.user_id AS UNSIGNED)')
      .select([
        'c.clothingId AS clothingId',
        'c.userId AS userId',
        'u.user_name AS userName',
        'c.name AS name',
        'c.category AS category',
        'c.color AS color',
        'c.brand AS brand',
        'c.imageUrl AS imageUrl',
        'c.isFavorite AS isFavorite',
        'c.isFrequent AS isFrequent',
        'c.createTime AS createTime',
      ])
      .where('c.del_flag = :normal', { normal: '0' });
    if (query.keyword) qb.andWhere('(c.name LIKE :kw OR u.user_name LIKE :kw)', { kw: `%${query.keyword}%` });
    if (query.category) qb.andWhere('c.category = :category', { category: query.category });
    return this.pageRaw(qb, query);
  }

  listOutfits(query: WardrobeAdminQueryDto) {
    const qb = this.outfitRepo
      .createQueryBuilder('o')
      .leftJoin(UserEntity, 'u', 'u.user_id = CAST(o.user_id AS UNSIGNED)')
      .select([
        'o.outfitId AS outfitId',
        'o.userId AS userId',
        'u.user_name AS userName',
        'o.scene AS scene',
        'o.title AS title',
        'o.score AS score',
        'o.weather AS weather',
        'o.isSaved AS isSaved',
        'o.previewImageUrl AS previewImageUrl',
        'o.renderStatus AS renderStatus',
        'o.tryOnImageUrl AS tryOnImageUrl',
        'o.tryOnStatus AS tryOnStatus',
        'o.createTime AS createTime',
      ])
      .where('o.del_flag = :normal', { normal: '0' });
    if (query.keyword) qb.andWhere('(o.title LIKE :kw OR u.user_name LIKE :kw)', { kw: `%${query.keyword}%` });
    return this.pageRaw(qb, query);
  }

  listEntity(type: string, query: WardrobeAdminQueryDto) {
    const config = this.entityConfig(type);
    const qb = config.repo.createQueryBuilder('e').where('e.del_flag = :normal', { normal: '0' });
    if (query.keyword && config.keyword) qb.andWhere(`e.${config.keyword} LIKE :kw`, { kw: `%${query.keyword}%` });
    if (query.status && config.status) qb.andWhere(`e.${config.status} = :status`, { status: query.status });
    qb.orderBy('e.create_time', 'DESC');
    return this.page(qb, query);
  }

  async saveChallenge(body: Partial<StyleChallengeEntity>) {
    const current = body.challengeId ? await this.challengeRepo.findOne({ where: { challengeId: body.challengeId } }) : null;
    const challenge = this.challengeRepo.merge(current || this.challengeRepo.create(), {
      ...body,
      reward: body.reward || '',
      colors: body.colors || [],
    });
    return ResultData.ok(await this.challengeRepo.save(challenge));
  }

  async updateEntity(type: string, id: string, body: any) {
    const config = this.entityConfig(type);
    const item = await config.repo.findOne({ where: { [config.id]: id } as any });
    if (!item) throw new NotFoundException('数据不存在');
    return ResultData.ok(await config.repo.save(config.repo.merge(item, body)));
  }

  async removeEntity(type: string, id: string) {
    const config = this.entityConfig(type);
    await config.repo.update({ [config.id]: id } as any, { delFlag: '1' });
    return ResultData.ok();
  }

  async updateMembership(userId: string, body: any) {
    const current = await this.membershipRepo.findOne({ where: { userId } });
    const membership = this.membershipRepo.merge(current || this.membershipRepo.create({ userId }), {
      planCode: body.planCode || 'free',
      expireTime: body.expireTime || null,
      wardrobeLimit: body.planCode === 'pro' ? 999 : 30,
      memberStatus: body.memberStatus || '0',
    });
    const saved = await this.membershipRepo.save(membership);
    await this.profileRepo.update({ userId }, { isPro: saved.planCode === 'pro' ? 1 : 0 });
    return ResultData.ok(saved);
  }

  private entityConfig(type: string): any {
    const configs = {
      challenges: { repo: this.challengeRepo, id: 'challengeId', keyword: 'title', status: 'status' },
      submissions: { repo: this.submissionRepo, id: 'submissionId', keyword: 'title', status: 'auditStatus' },
      'ai-logs': { repo: this.aiLogRepo, id: 'logId', keyword: 'scene', status: 'callStatus' },
      feedback: { repo: this.feedbackRepo, id: 'feedbackId', keyword: 'title', status: 'handleStatus' },
      memberships: { repo: this.membershipRepo, id: 'membershipId', keyword: 'userId', status: 'memberStatus' },
      clothing: { repo: this.clothingRepo, id: 'clothingId' },
      outfits: { repo: this.outfitRepo, id: 'outfitId' },
    };
    const config = configs[type];
    if (!config) throw new NotFoundException('管理资源不存在');
    return config;
  }

  private async page(qb: any, query: WardrobeAdminQueryDto) {
    const pageNum = Math.max(Number(query.pageNum || 1), 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize || 10), 1), 100);
    const [list, total] = await qb
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return ResultData.ok({ list, total });
  }

  private async pageRaw(qb: any, query: WardrobeAdminQueryDto) {
    const pageNum = Math.max(Number(query.pageNum || 1), 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize || 10), 1), 100);
    const total = await qb.clone().getCount();
    const list = await qb
      .offset((pageNum - 1) * pageSize)
      .limit(pageSize)
      .orderBy('createTime', 'DESC')
      .getRawMany();
    return ResultData.ok({ list, total });
  }
}
