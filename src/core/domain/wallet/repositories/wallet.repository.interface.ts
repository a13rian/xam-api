import { Wallet } from '../entities/wallet.entity';

export const WALLET_REPOSITORY = Symbol('IWalletRepository');

export interface WalletSearchParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface WalletSearchResult {
  items: Wallet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IWalletRepository {
  findById(id: string): Promise<Wallet | null>;
  findByUserId(userId: string): Promise<Wallet | null>;
  findAll(params: WalletSearchParams): Promise<WalletSearchResult>;
  save(wallet: Wallet): Promise<void>;
  exists(userId: string): Promise<boolean>;
}
