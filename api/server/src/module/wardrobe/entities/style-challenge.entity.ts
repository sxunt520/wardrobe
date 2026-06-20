import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';

@Entity('app_style_challenge', { comment: '每日搭配挑战' })
export class StyleChallengeEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'challenge_id', comment: '挑战ID' })
  challengeId: string;

  @Column({ type: 'varchar', name: 'tag', length: 64, comment: '挑战标签' })
  tag: string;

  @Column({ type: 'varchar', name: 'title', length: 120, comment: '挑战标题' })
  title: string;

  @Column({ type: 'varchar', name: 'reward', length: 64, default: '', comment: '奖励' })
  reward: string;

  @Column({ type: 'int', name: 'participants', default: 0, comment: '参与人数' })
  participants: number;

  @Column({ type: 'simple-json', name: 'colors', nullable: true, comment: '主题色' })
  colors: string[];
}
