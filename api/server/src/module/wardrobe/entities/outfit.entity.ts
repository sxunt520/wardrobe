import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';

@Entity('app_outfit', { comment: 'AI搭配记录' })
export class OutfitEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'outfit_id', comment: '搭配ID' })
  outfitId: string;

  @Column({ type: 'varchar', name: 'user_id', length: 64, comment: '用户ID' })
  userId: string;

  @Column({ type: 'varchar', name: 'scene', length: 32, comment: '场景' })
  scene: string;

  @Column({ type: 'varchar', name: 'title', length: 120, comment: '搭配标题' })
  title: string;

  @Column({ type: 'text', name: 'reason', comment: '推荐理由' })
  reason: string;

  @Column({ type: 'int', name: 'score', default: 0, comment: '评分' })
  score: number;

  @Column({ type: 'simple-json', name: 'clothing_ids', nullable: true, comment: '衣物ID列表' })
  clothingIds: string[];

  @Column({ type: 'simple-json', name: 'pieces', nullable: true, comment: '单品名称列表' })
  pieces: string[];

  @Column({ type: 'simple-json', name: 'colors', nullable: true, comment: '颜色列表' })
  colors: string[];

  @Column({ type: 'varchar', name: 'weather', length: 120, default: '', comment: '天气' })
  weather: string;

  @Column({ type: 'tinyint', name: 'is_saved', default: 0, comment: '是否保存' })
  isSaved: number;

  @Column({ type: 'varchar', name: 'preview_image_url', length: 500, default: '', comment: '搭配平铺效果图' })
  previewImageUrl: string;

  @Column({ type: 'varchar', name: 'render_status', length: 16, default: 'pending', comment: '效果图状态' })
  renderStatus: string;

  @Column({ type: 'varchar', name: 'render_error', length: 500, default: '', comment: '效果图失败原因' })
  renderError: string;

  @Column({ type: 'varchar', name: 'try_on_person_url', length: 500, default: '', comment: '试穿人物原图' })
  tryOnPersonUrl: string;

  @Column({ type: 'varchar', name: 'try_on_image_url', length: 500, default: '', comment: '真人试穿结果图' })
  tryOnImageUrl: string;

  @Column({ type: 'varchar', name: 'try_on_task_id', length: 80, default: '', comment: '阿里试衣任务ID' })
  tryOnTaskId: string;

  @Column({ type: 'varchar', name: 'try_on_status', length: 24, default: 'idle', comment: '真人试穿状态' })
  tryOnStatus: string;

  @Column({ type: 'varchar', name: 'try_on_error', length: 500, default: '', comment: '真人试穿失败原因' })
  tryOnError: string;
}
