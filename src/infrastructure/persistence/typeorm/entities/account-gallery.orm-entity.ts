import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseOrmEntity } from './base.orm-entity';
import { AccountOrmEntity } from './account.orm-entity';

@Entity('account_gallery')
@Index(['accountId', 'sortOrder'])
export class AccountGalleryOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'gal';

  @Column('varchar', { length: 255 })
  @Index()
  accountId: string;

  @ManyToOne(() => AccountOrmEntity, (account) => account.gallery, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'accountId' })
  account: AccountOrmEntity;

  @Column({ type: 'varchar', length: 500 })
  imageUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  storageKey: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  caption: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}
