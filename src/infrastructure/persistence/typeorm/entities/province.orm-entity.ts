import { Entity, Column, Index, OneToMany, Relation } from 'typeorm';
import { BaseOrmEntity } from './base.orm-entity';
import { DistrictOrmEntity } from './district.orm-entity';

@Entity('provinces')
@Index(['code'], { unique: true })
@Index(['slug'], { unique: true })
@Index(['isActive'])
export class ProvinceOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'prv';
  @Column({ type: 'varchar', length: 10, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nameEn?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // "thanh-pho" | "tinh"

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
  @OneToMany(() => DistrictOrmEntity, (district) => district.province)
  districts: Relation<DistrictOrmEntity[]>;
}
