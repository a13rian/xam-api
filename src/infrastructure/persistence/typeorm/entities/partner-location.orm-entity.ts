import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { PartnerOrmEntity } from './partner.orm-entity';

@Entity('partner_locations')
export class PartnerLocationOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  partnerId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text' })
  street: string;

  @Column({ length: 100, nullable: true })
  ward?: string;

  @Column({ length: 100 })
  district: string;

  @Column({ length: 100 })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => PartnerOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partnerId' })
  partner?: PartnerOrmEntity;
}
