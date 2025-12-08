import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { PartnerOrmEntity } from './partner.orm-entity';
import { UserOrmEntity } from './user.orm-entity';
import {
  DocumentTypeEnum,
  DocumentStatusEnum,
} from '../../../../core/domain/partner/entities/partner-document.entity';

@Entity('partner_documents')
export class PartnerDocumentOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  partnerId: string;

  @ManyToOne(() => PartnerOrmEntity, (partner) => partner.documents)
  @JoinColumn({ name: 'partnerId' })
  partner: PartnerOrmEntity;

  @Column({ type: 'enum', enum: DocumentTypeEnum })
  type: DocumentTypeEnum;

  @Column({ type: 'text' })
  url: string;

  @Column({
    type: 'enum',
    enum: DocumentStatusEnum,
    default: DocumentStatusEnum.PENDING,
  })
  @Index()
  status: DocumentStatusEnum;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string | null;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewedBy' })
  reviewer: UserOrmEntity | null;

  @CreateDateColumn()
  createdAt: Date;
}
