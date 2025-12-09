import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import type { WalletTransactionOrmEntity } from './wallet-transaction.orm-entity';

@Entity('wallets')
@Check('"balance" >= 0')
export class WalletOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('WalletTransactionOrmEntity', 'wallet')
  transactions: WalletTransactionOrmEntity[];
}
