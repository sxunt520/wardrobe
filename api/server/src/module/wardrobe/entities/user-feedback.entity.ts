import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';

@Entity('app_user_feedback', { comment: 'APP用户反馈' })
export class UserFeedbackEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'feedback_id' })
  feedbackId: string;

  @Column({ type: 'varchar', name: 'user_id', length: 64 })
  userId: string;

  @Column({ type: 'varchar', name: 'feedback_type', length: 32, default: '建议' })
  feedbackType: string;

  @Column({ type: 'varchar', name: 'title', length: 120 })
  title: string;

  @Column({ type: 'text', name: 'content' })
  content: string;

  @Column({ type: 'varchar', name: 'contact', length: 120, default: '' })
  contact: string;

  @Column({ type: 'char', name: 'handle_status', length: 1, default: '0', comment: '0待处理 1处理中 2已完成' })
  handleStatus: string;

  @Column({ type: 'varchar', name: 'reply', length: 1000, default: '' })
  reply: string;
}
