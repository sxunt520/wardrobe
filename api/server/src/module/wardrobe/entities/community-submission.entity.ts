import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';

@Entity('app_community_submission', { comment: '社区穿搭投稿' })
export class CommunitySubmissionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'submission_id' })
  submissionId: string;

  @Column({ type: 'varchar', name: 'user_id', length: 64 })
  userId: string;

  @Column({ type: 'varchar', name: 'challenge_id', length: 64, default: '' })
  challengeId: string;

  @Column({ type: 'varchar', name: 'title', length: 120 })
  title: string;

  @Column({ type: 'varchar', name: 'image_url', length: 500, default: '' })
  imageUrl: string;

  @Column({ type: 'text', name: 'content', nullable: true })
  content: string;

  @Column({ type: 'int', name: 'ai_score', default: 0 })
  aiScore: number;

  @Column({ type: 'char', name: 'audit_status', length: 1, default: '0', comment: '0待审 1通过 2拒绝' })
  auditStatus: string;

  @Column({ type: 'varchar', name: 'audit_reason', length: 500, default: '' })
  auditReason: string;
}
