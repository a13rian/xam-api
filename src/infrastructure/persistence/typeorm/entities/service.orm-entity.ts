import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BookingTypeEnum } from '../../../../core/domain/service/value-objects/booking-type.vo';
import { PartnerOrmEntity } from './partner.orm-entity';
import { ServiceCategoryOrmEntity } from './service-category.orm-entity';

@Entity('services')
@Index(['partnerId', 'isActive'])
export class ServiceOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  partnerId: string;

  @Index()
  @Column('uuid')
  categoryId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  priceAmount: number;

  @Column({ length: 3, default: 'VND' })
  priceCurrency: string;

  @Column({ type: 'int' })
  durationMinutes: number;

  @Column({
    type: 'enum',
    enum: BookingTypeEnum,
    default: BookingTypeEnum.TIME_SLOT,
  })
  bookingType: BookingTypeEnum;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => PartnerOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partnerId' })
  partner?: PartnerOrmEntity;

  @ManyToOne(() => ServiceCategoryOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category?: ServiceCategoryOrmEntity;
}
