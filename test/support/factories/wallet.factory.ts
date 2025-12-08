import { v4 as uuidv4 } from 'uuid';
import { DatabaseHelper } from '../database/database.helper';
import { WalletOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/wallet.orm-entity';

export interface CreateWalletOptions {
  userId: string;
  balance?: number;
  currency?: string;
}

export interface CreatedWallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
}

export class WalletFactory {
  constructor(private readonly db: DatabaseHelper) {}

  async create(options: CreateWalletOptions): Promise<CreatedWallet> {
    const walletRepo = this.db.getRepository(WalletOrmEntity);

    const wallet = walletRepo.create({
      id: uuidv4(),
      userId: options.userId,
      balance: options.balance ?? 0,
      currency: options.currency ?? 'VND',
    });

    await walletRepo.save(wallet);

    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: Number(wallet.balance),
      currency: wallet.currency,
    };
  }

  async createWithBalance(
    userId: string,
    balance: number,
  ): Promise<CreatedWallet> {
    return this.create({ userId, balance });
  }
}
