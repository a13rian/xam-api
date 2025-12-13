import {
  Entity,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import type { WalletTransactionOrmEntity } from './wallet-transaction.orm-entity';
import { BaseOrmEntity } from './base.orm-entity';

@Entity('wallets')
@Check('"balance" >= 0')
export class WalletOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'wlt';

  @Column({ type: 'uuid', unique: true })
  @Index()
  userId: string;

  @OneToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'userId' })
  user: UserOrmEntity;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ length: 3, default: 'VND' })
  currency: string;

  @OneToMany('WalletTransactionOrmEntity', 'wallet')
  transactions: WalletTransactionOrmEntity[];
}
