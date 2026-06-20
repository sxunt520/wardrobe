import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';

@Entity('app_user_membership', { comment: 'APP会员状态' })
@Unique(['userId'])
export class UserMembershipEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'membership_id' })
  membershipId: number;

  @Column({ type: 'varchar', name: 'user_id', length: 64 })
  userId: string;

  @Column({ type: 'varchar', name: 'plan_code', length: 32, default: 'free' })
  planCode: string;

  @Column({ type: 'datetime', name: 'expire_time', nullable: true })
  expireTime: Date;

  @Column({ type: 'tinyint', name: 'wardrobe_limit', default: 30 })
  wardrobeLimit: number;

  @Column({ type: 'char', name: 'member_status', length: 1, default: '0', comment: '0正常 1过期 2停用' })
  memberStatus: string;
}
