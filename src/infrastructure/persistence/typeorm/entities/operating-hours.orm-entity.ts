import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { DayOfWeek } from '../../../../core/domain/location/entities/operating-hours.entity';
import { OrganizationLocationOrmEntity } from './organization-location.orm-entity';
import { BaseOrmEntity } from './base.orm-entity';

@Entity('operating_hours')
@Unique(['locationId', 'dayOfWeek'])
export class OperatingHoursOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'hrs';

  @Index()
  @Column('varchar', { length: 255 })
  locationId: string;

  @Column({ type: 'smallint' })
  dayOfWeek: DayOfWeek;

  @Column({ type: 'time' })
  openTime: string;

  @Column({ type: 'time' })
  closeTime: string;

  @Column({ default: false })
  isClosed: boolean;

  @ManyToOne(() => OrganizationLocationOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location?: OrganizationLocationOrmEntity;
}
