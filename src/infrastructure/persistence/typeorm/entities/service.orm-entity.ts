import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BookingTypeEnum } from '../../../../core/domain/service/value-objects/booking-type.vo';
import { OrganizationOrmEntity } from './organization.orm-entity';
import { ServiceCategoryOrmEntity } from './service-category.orm-entity';
import { BaseOrmEntity } from './base.orm-entity';

@Entity('services')
@Index(['organizationId', 'isActive'])
export class ServiceOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'srv';

  @Index()
  @Column('uuid')
  organizationId: string;

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

  @ManyToOne(() => OrganizationOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization?: OrganizationOrmEntity;

  @ManyToOne(() => ServiceCategoryOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category?: ServiceCategoryOrmEntity;
}
