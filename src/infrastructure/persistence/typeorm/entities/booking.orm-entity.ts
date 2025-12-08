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
import { BookingStatusEnum } from '../../../../core/domain/booking/value-objects/booking-status.vo';
import { UserOrmEntity } from './user.orm-entity';
import { PartnerOrmEntity } from './partner.orm-entity';
import { PartnerLocationOrmEntity } from './partner-location.orm-entity';

@Entity('bookings')
@Index(['customerId', 'status'])
@Index(['partnerId', 'scheduledDate'])
export class BookingOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  customerId: string;

  @Index()
  @Column('uuid')
  partnerId: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'customerId' })
  customer?: UserOrmEntity;

  @ManyToOne(() => PartnerOrmEntity)
  @JoinColumn({ name: 'partnerId' })
  partner?: PartnerOrmEntity;

  @ManyToOne(() => PartnerLocationOrmEntity)
  @JoinColumn({ name: 'locationId' })
  location?: PartnerLocationOrmEntity;

  @OneToMany(() => BookingServiceOrmEntity, (bs) => bs.booking, {
    cascade: true,
  })
  services?: BookingServiceOrmEntity[];
}

@Entity('booking_services')
export class BookingServiceOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

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
  @JoinColumn({ name: 'bookingId' })
  booking?: BookingOrmEntity;
}
