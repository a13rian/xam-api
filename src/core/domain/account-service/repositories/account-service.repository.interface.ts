import { AccountService } from '../entities/account-service.entity';

export const ACCOUNT_SERVICE_REPOSITORY = Symbol('ACCOUNT_SERVICE_REPOSITORY');

export interface AccountServiceSearchOptions {
  accountId?: string;
  categoryId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AccountServiceSearchResult {
  items: AccountService[];
  total: number;
  page: number;
  limit: number;
}

export interface IAccountServiceRepository {
  findById(id: string): Promise<AccountService | null>;
  findByAccountId(
    accountId: string,
    activeOnly?: boolean,
  ): Promise<AccountService[]>;
  findByCategoryId(categoryId: string): Promise<AccountService[]>;
  search(
    options: AccountServiceSearchOptions,
  ): Promise<AccountServiceSearchResult>;
  save(service: AccountService): Promise<void>;
  delete(id: string): Promise<void>;
  existsByAccountIdAndName(
    accountId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean>;
}
