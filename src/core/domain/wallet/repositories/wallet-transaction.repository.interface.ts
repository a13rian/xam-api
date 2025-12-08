import { WalletTransaction } from '../entities/wallet-transaction.entity';
import { PaginationOptions } from '../../../../shared/interfaces/pagination.interface';

export const WALLET_TRANSACTION_REPOSITORY = Symbol(
  'IWalletTransactionRepository',
);

export interface IWalletTransactionRepository {
  findById(id: string): Promise<WalletTransaction | null>;
  findByWalletId(
    walletId: string,
    options?: PaginationOptions,
  ): Promise<WalletTransaction[]>;
  countByWalletId(walletId: string): Promise<number>;
  findByReference(
    referenceType: string,
    referenceId: string,
  ): Promise<WalletTransaction[]>;
  save(transaction: WalletTransaction): Promise<void>;
}
