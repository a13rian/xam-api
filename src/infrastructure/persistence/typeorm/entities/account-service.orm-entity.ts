import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseOrmEntity } from './base.orm-entity';
import { AccountOrmEntity } from './account.orm-entity';
import { ServiceCategoryOrmEntity } from './service-category.orm-entity';

@Entity('account_services')
@Index(['accountId', 'isActive'])
@Index(['accountId', 'name'], { unique: true, where: '"deleted_at" IS NULL' })
export class AccountServiceOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'asv';

  @Index()
  @Column('varchar', { length: 255 })
  accountId: string;

  @Index()
  @Column('varchar', { length: 255 })
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

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @ManyToOne(() => AccountOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account?: AccountOrmEntity;

  @ManyToOne(() => ServiceCategoryOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category?: ServiceCategoryOrmEntity;
}
