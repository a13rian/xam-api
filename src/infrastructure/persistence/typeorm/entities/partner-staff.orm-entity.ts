import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { StaffRoleEnum } from '../../../../core/domain/partner/value-objects/staff-role.vo';
import { InvitationStatusEnum } from '../../../../core/domain/partner/value-objects/invitation-status.vo';
import { PartnerOrmEntity } from './partner.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

@Entity('partner_staff')
@Index(['partnerId', 'userId'], { unique: true, where: '"userId" IS NOT NULL' })
@Index(['partnerId', 'email'], { unique: true })
export class PartnerStaffOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  partnerId: string;

  @Index()
  @Column('uuid', { nullable: true })
  userId?: string;

  @Column({ length: 255 })
  email: string;

  @Column({
    type: 'enum',
    enum: StaffRoleEnum,
    default: StaffRoleEnum.STAFF,
  })
  role: StaffRoleEnum;

  @Column({
    type: 'enum',
    enum: InvitationStatusEnum,
    default: InvitationStatusEnum.PENDING,
  })
  invitationStatus: InvitationStatusEnum;

  @Index({ unique: true, where: '"invitationToken" IS NOT NULL' })
  @Column('uuid', { nullable: true })
  invitationToken?: string;

  @Column({ type: 'timestamp' })
  invitedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => PartnerOrmEntity)
  @JoinColumn({ name: 'partnerId' })
  partner?: PartnerOrmEntity;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'userId' })
  user?: UserOrmEntity;
}
