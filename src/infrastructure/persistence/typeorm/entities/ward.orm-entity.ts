import {
  Entity,
  Column,
  Index,
  JoinColumn,
  ManyToOne,
  Relation,
} from 'typeorm';
import { BaseOrmEntity } from './base.orm-entity';
import { DistrictOrmEntity } from './district.orm-entity';

@Entity('wards')
@Index(['code'], { unique: true })
@Index(['districtId', 'code'], { unique: true })
@Index(['slug'])
@Index(['districtId'])
@Index(['isActive'])
export class WardOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'wrd';
  @Column({ type: 'varchar', length: 10, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nameEn?: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // "phuong" | "xa" | "thi-tran"

  @Column({ type: 'varchar', length: 255 })
  districtId: string;

  @Column({ type: 'real', nullable: true })
  latitude?: number;

  @Column({ type: 'real', nullable: true })
  longitude?: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  order: number;

  // Relations
  @ManyToOne(() => DistrictOrmEntity, (district) => district.wards)
  @JoinColumn({ name: 'district_id' })
  district: Relation<DistrictOrmEntity>;
}
