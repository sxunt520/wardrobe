import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';

@Entity('app_clothing_item', { comment: '衣橱单品' })
export class ClothingItemEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'clothing_id', comment: '衣物ID' })
  clothingId: string;

  @Column({ type: 'varchar', name: 'user_id', length: 64, comment: '用户ID' })
  userId: string;

  @Column({ type: 'varchar', name: 'name', length: 100, comment: '单品名称' })
  name: string;

  @Column({ type: 'varchar', name: 'category', length: 32, comment: '分类' })
  category: string;

  @Column({ type: 'varchar', name: 'color', length: 64, default: '', comment: '颜色' })
  color: string;

  @Column({ type: 'varchar', name: 'texture', length: 64, default: '', comment: '纹理' })
  texture: string;

  @Column({ type: 'varchar', name: 'brand', length: 64, default: '', comment: '品牌' })
  brand: string;

  @Column({ type: 'varchar', name: 'season', length: 32, default: '四季', comment: '季节' })
  season: string;

  @Column({ type: 'varchar', name: 'image_url', length: 500, default: '', comment: '图片地址' })
  imageUrl: string;

  @Column({ type: 'simple-json', name: 'tags', nullable: true, comment: '标签' })
  tags: string[];

  @Column({ type: 'tinyint', name: 'is_favorite', default: 0, comment: '是否收藏' })
  isFavorite: number;

  @Column({ type: 'tinyint', name: 'is_frequent', default: 0, comment: '是否常穿' })
  isFrequent: number;

  @Column({ type: 'int', name: 'ai_confidence', default: 0, comment: 'AI识别置信度' })
  aiConfidence: number;
}
