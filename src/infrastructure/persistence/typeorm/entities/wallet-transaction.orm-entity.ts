import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import type { WalletOrmEntity } from './wallet.orm-entity';
import { TransactionTypeEnum } from '../../../../core/domain/wallet/value-objects/transaction-type.vo';
import { BaseOrmEntity } from './base.orm-entity';

@Entity('wallet_transactions')
@Index(['walletId', 'createdAt'])
export class WalletTransactionOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'wtx';

  @Column({ type: 'uuid' })
  @Index()
  walletId: string;

  @ManyToOne('WalletOrmEntity', 'transactions')
  @JoinColumn({ name: 'walletId' })
  wallet: WalletOrmEntity;

  @Column({ type: 'enum', enum: TransactionTypeEnum })
  type: TransactionTypeEnum;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  balanceAfter: number;

  @Column({ length: 3, default: 'VND' })
  currency: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  referenceType: string | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  referenceId: string | null;

  @Column({ type: 'text' })
  description: string;
}
