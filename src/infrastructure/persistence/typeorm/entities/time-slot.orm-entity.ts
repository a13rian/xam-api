import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { TimeSlotStatus } from '../../../../core/domain/schedule/entities/time-slot.entity';
import { OrganizationLocationOrmEntity } from './organization-location.orm-entity';
import { BaseOrmEntity } from './base.orm-entity';

@Entity('time_slots')
@Index(['locationId', 'date', 'status'])
@Unique(['locationId', 'staffId', 'date', 'startTime'])
export class TimeSlotOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'slt';

  @Index()
  @Column('uuid')
  locationId: string;

  @Index()
  @Column('uuid', { nullable: true })
  staffId?: string;

  @Index()
  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({
    type: 'enum',
    enum: TimeSlotStatus,
    default: TimeSlotStatus.AVAILABLE,
  })
  status: TimeSlotStatus;

  @Column('uuid', { nullable: true })
  bookingId?: string;

  @ManyToOne('BookingOrmEntity', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bookingId' })
  booking?: any;

  @ManyToOne(() => OrganizationLocationOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'locationId' })
  location?: OrganizationLocationOrmEntity;
}
