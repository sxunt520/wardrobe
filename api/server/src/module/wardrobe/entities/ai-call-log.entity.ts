import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';

@Entity('app_ai_call_log', { comment: 'AI调用日志' })
export class AiCallLogEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'log_id' })
  logId: number;

  @Column({ type: 'varchar', name: 'user_id', length: 64, default: '' })
  userId: string;

  @Column({ type: 'varchar', name: 'scene', length: 64, default: '' })
  scene: string;

  @Column({ type: 'varchar', name: 'model', length: 64, default: '' })
  model: string;

  @Column({ type: 'char', name: 'call_status', length: 1, default: '0', comment: '0成功 1失败 2回退' })
  callStatus: string;

  @Column({ type: 'int', name: 'duration_ms', default: 0 })
  durationMs: number;

  @Column({ type: 'text', name: 'error_message', nullable: true })
  errorMessage: string;
}
