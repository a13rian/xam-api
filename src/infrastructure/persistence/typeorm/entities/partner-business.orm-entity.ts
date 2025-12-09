import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { PartnerOrmEntity } from './partner.orm-entity';

@Entity('partner_businesses')
export class PartnerBusinessOrmEntity {
  @PrimaryColumn('uuid')
  partnerId: string;

  @OneToOne('PartnerOrmEntity', 'business', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partnerId' })
  partner: PartnerOrmEntity;

  @Column({ type: 'varchar' })
  businessName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  businessLicense: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  companySize: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string | null;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  socialMedia: Record<string, string>;

  @Column({ type: 'date', nullable: true })
  establishedDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
