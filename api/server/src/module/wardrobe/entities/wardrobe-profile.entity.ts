import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';

@Entity('app_wardrobe_profile', { comment: '衣橱管家用户档案' })
export class WardrobeProfileEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'profile_id', comment: '档案ID' })
  profileId: string;

  @Column({ type: 'varchar', name: 'user_id', length: 64, comment: '用户ID' })
  userId: string;

  @Column({ type: 'varchar', name: 'nickname', length: 64, default: '衣橱用户', comment: '昵称' })
  nickname: string;

  @Column({ type: 'int', name: 'height', nullable: true, comment: '身高cm' })
  height: number;

  @Column({ type: 'int', name: 'weight', nullable: true, comment: '体重kg' })
  weight: number;

  @Column({ type: 'varchar', name: 'body_shape', length: 32, default: '', comment: '体型' })
  bodyShape: string;

  @Column({ type: 'varchar', name: 'skin_tone', length: 32, default: '', comment: '肤色' })
  skinTone: string;

  @Column({ type: 'simple-json', name: 'style_preferences', nullable: true, comment: '风格偏好' })
  stylePreferences: string[];

  @Column({ type: 'simple-json', name: 'avoid_colors', nullable: true, comment: '避开颜色' })
  avoidColors: string[];

  @Column({ type: 'simple-json', name: 'brand_preferences', nullable: true, comment: '品牌偏好' })
  brandPreferences: string[];

  @Column({ type: 'tinyint', name: 'is_pro', default: 0, comment: '是否付费用户' })
  isPro: number;
}
