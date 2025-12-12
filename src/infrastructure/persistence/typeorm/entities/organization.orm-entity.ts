import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { OrganizationStatusEnum } from '../../../../core/domain/organization/value-objects/organization-status.vo';

@Entity('organizations')
export class OrganizationOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: OrganizationStatusEnum })
  @Index()
  status: OrganizationStatusEnum;

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

  // Business fields (merged from PartnerBusiness)
  @Column({ length: 200 })
  businessName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  businessLicense: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  companySize: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string | null;

  @Column({ type: 'jsonb', default: '{}' })
  socialMedia: Record<string, string>;

  @Column({ type: 'date', nullable: true })
  establishedDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
