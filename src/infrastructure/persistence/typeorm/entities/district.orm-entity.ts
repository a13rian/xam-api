import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Relation,
} from 'typeorm';
import { BaseOrmEntity } from './base.orm-entity';
import { ProvinceOrmEntity } from './province.orm-entity';
import { WardOrmEntity } from './ward.orm-entity';

@Entity('districts')
@Index(['code'], { unique: true })
@Index(['provinceId', 'code'], { unique: true })
@Index(['slug'])
@Index(['provinceId'])
@Index(['isActive'])
export class DistrictOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'dst';
  @Column({ type: 'varchar', length: 10, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nameEn?: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // "quan" | "huyen" | "thi-xa" | "thanh-pho"

  @ManyToOne(() => ProvinceOrmEntity, (province) => province.districts)
  @JoinColumn({ name: 'province_id' })
  province: Relation<ProvinceOrmEntity>;

  @Column({ type: 'varchar', length: 255 })
  provinceId: string;

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
  @OneToMany(() => WardOrmEntity, (ward) => ward.district)
  wards: Relation<WardOrmEntity[]>;
}
