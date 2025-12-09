import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import type { PartnerDocumentOrmEntity } from './partner-document.orm-entity';
import type { PartnerBusinessOrmEntity } from './partner-business.orm-entity';
import type { PartnerIndividualOrmEntity } from './partner-individual.orm-entity';
import { PartnerTypeEnum } from '../../../../core/domain/partner/value-objects/partner-type.vo';
import { PartnerStatusEnum } from '../../../../core/domain/partner/value-objects/partner-status.vo';

@Entity('partners')
export class PartnerOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  @Index()
  userId: string;

  @OneToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'userId' })
  user: UserOrmEntity;

  @Column({ type: 'enum', enum: PartnerTypeEnum })
  @Index()
  type: PartnerTypeEnum;

  @Column({ type: 'enum', enum: PartnerStatusEnum })
  @Index()
  status: PartnerStatusEnum;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: false })
  isHomeServiceEnabled: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  homeServiceRadiusKm: number | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('PartnerDocumentOrmEntity', 'partner')
  documents: PartnerDocumentOrmEntity[];

  @OneToOne('PartnerBusinessOrmEntity', 'partner')
  business: PartnerBusinessOrmEntity;

  @OneToOne('PartnerIndividualOrmEntity', 'partner')
  individual: PartnerIndividualOrmEntity;
}
