import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';

@Entity('app_try_on_record', { comment: '真人试穿历史记录' })
export class TryOnRecordEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'record_id', comment: '试穿记录ID' })
  recordId: string;

  @Column({ type: 'varchar', name: 'user_id', length: 64, comment: '用户ID' })
  userId: string;

  @Column({ type: 'varchar', name: 'outfit_id', length: 36, comment: '搭配ID' })
  outfitId: string;

  @Column({ type: 'varchar', name: 'outfit_title', length: 120, default: '', comment: '搭配标题快照' })
  outfitTitle: string;

  @Column({ type: 'varchar', name: 'scene', length: 32, default: '', comment: '场景快照' })
  scene: string;

  @Column({ type: 'simple-json', name: 'clothing_ids', nullable: true, comment: '衣物ID快照' })
  clothingIds: string[];

  @Column({ type: 'varchar', name: 'person_image_url', length: 500, default: '', comment: '人物原图' })
  personImageUrl: string;

  @Column({ type: 'varchar', name: 'top_garment_url', length: 500, default: '', comment: '上装图片快照' })
  topGarmentUrl: string;

  @Column({ type: 'varchar', name: 'bottom_garment_url', length: 500, default: '', comment: '下装图片快照' })
  bottomGarmentUrl: string;

  @Column({ type: 'varchar', name: 'result_image_url', length: 500, default: '', comment: '试穿结果图' })
  resultImageUrl: string;

  @Column({ type: 'varchar', name: 'task_id', length: 80, default: '', comment: '阿里试衣任务ID' })
  taskId: string;

  @Column({ type: 'varchar', name: 'try_on_status', length: 24, default: 'submitting', comment: '试穿状态' })
  tryOnStatus: string;

  @Column({ type: 'varchar', name: 'error_message', length: 500, default: '', comment: '失败原因' })
  errorMessage: string;
}
