import { Wallet } from '../entities/wallet.entity';

export const WALLET_REPOSITORY = Symbol('IWalletRepository');

export interface IWalletRepository {
  findById(id: string): Promise<Wallet | null>;
  findByUserId(userId: string): Promise<Wallet | null>;
  save(wallet: Wallet): Promise<void>;
  exists(userId: string): Promise<boolean>;
}
