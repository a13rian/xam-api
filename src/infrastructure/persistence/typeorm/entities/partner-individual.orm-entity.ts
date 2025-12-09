import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PartnerOrmEntity } from './partner.orm-entity';

@Entity('partner_individuals')
export class PartnerIndividualOrmEntity {
  @PrimaryColumn('uuid')
  partnerId: string;

  @OneToOne(() => PartnerOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partnerId' })
  partner: PartnerOrmEntity;

  @Column({ type: 'varchar' })
  displayName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  idCardNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  specialization: string | null;

  @Column({ type: 'smallint', nullable: true })
  yearsExperience: number | null;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  certifications: string[];

  @Column({ type: 'text', nullable: true })
  portfolio: string | null;

  @Column({ type: 'text', nullable: true })
  personalBio: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
