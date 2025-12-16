import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BookingStatusEnum } from '../../../../core/domain/booking/value-objects/booking-status.vo';
import { BaseOrmEntity } from './base.orm-entity';
import { OrganizationLocationOrmEntity } from './organization-location.orm-entity';
import { OrganizationOrmEntity } from './organization.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

@Entity('bookings')
@Index(['customerId', 'status'])
@Index(['organizationId', 'scheduledDate'])
export class BookingOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'bkg';

  @Index()
  @Column('uuid')
  customerId: string;

  @Index()
  @Column('uuid')
  organizationId: string;

  @Index()
  @Column('uuid')
  locationId: string;

  @Column('uuid', { nullable: true })
  staffId?: string;

  @Column({
    type: 'enum',
    enum: BookingStatusEnum,
    default: BookingStatusEnum.PENDING,
  })
  status: BookingStatusEnum;

  @Index()
  @Column({ type: 'date' })
  scheduledDate: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ length: 3, default: 'VND' })
  currency: string;

  @Column({ default: false })
  isHomeService: boolean;

  @Column({ type: 'text', nullable: true })
  customerAddress?: string;

  @Column({ length: 20 })
  customerPhone: string;

  @Column({ length: 200 })
  customerName: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  @Column('uuid', { nullable: true })
  cancelledBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'customer_id' })
  customer?: UserOrmEntity;

  @ManyToOne(() => OrganizationOrmEntity)
  @JoinColumn({ name: 'organization_id' })
  organization?: OrganizationOrmEntity;

  @ManyToOne(() => OrganizationLocationOrmEntity)
  @JoinColumn({ name: 'location_id' })
  location?: OrganizationLocationOrmEntity;

  @OneToMany(() => BookingServiceOrmEntity, (bs) => bs.booking, {
    cascade: true,
  })
  services?: BookingServiceOrmEntity[];
}

@Entity('booking_services')
export class BookingServiceOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'bsv';

  @Index()
  @Column('uuid')
  bookingId: string;

  @Column('uuid')
  serviceId: string;

  @Column({ length: 200 })
  serviceName: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ length: 3, default: 'VND' })
  currency: string;

  @Column({ type: 'int' })
  durationMinutes: number;

  @ManyToOne(() => BookingOrmEntity, (b) => b.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking?: BookingOrmEntity;
}
