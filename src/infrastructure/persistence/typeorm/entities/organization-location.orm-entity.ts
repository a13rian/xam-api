import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { OrganizationOrmEntity } from './organization.orm-entity';
import { BaseOrmEntity } from './base.orm-entity';

@Entity('organization_locations')
export class OrganizationLocationOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'loc';

  @Index()
  @Column('varchar', { length: 255 })
  organizationId: string;

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

  @Index('IDX_organization_locations_location', { spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => OrganizationOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization?: OrganizationOrmEntity;
}
