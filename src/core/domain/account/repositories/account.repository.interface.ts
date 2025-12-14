import { Account } from '../entities/account.entity';
import { AccountStatusEnum } from '../value-objects/account-status.vo';
import { AccountTypeEnum } from '../value-objects/account-type.vo';
import { PaginationOptions } from '../../../../shared/interfaces/pagination.interface';

export const ACCOUNT_REPOSITORY = Symbol('IAccountRepository');

export interface AccountSearchOptions {
  latitude: number;
  longitude: number;
  radiusKm: number;
  search?: string;
  city?: string;
  district?: string;
  ward?: string;
  page: number;
  limit: number;
}

export interface AccountSearchResultItem {
  id: string;
  displayName: string;
  type: string;
  status: string;
  street: string | null;
  ward: string | null;
  district: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number;
}

export interface AccountSearchResult {
  items: AccountSearchResultItem[];
  total: number;
  page: number;
  limit: number;
}

export interface IAccountRepository {
  findById(id: string): Promise<Account | null>;
  findByUserId(userId: string): Promise<Account | null>;
  findByInvitationToken(token: string): Promise<Account | null>;
  findByOrganizationId(
    organizationId: string,
    options?: PaginationOptions,
  ): Promise<Account[]>;
  countByOrganizationId(organizationId: string): Promise<number>;
  findByOrganizationIdAndUserId(
    organizationId: string,
    userId: string,
  ): Promise<Account | null>;
  findByStatus(
    status: AccountStatusEnum,
    options?: PaginationOptions,
  ): Promise<Account[]>;
  countByStatus(status: AccountStatusEnum): Promise<number>;
  findByType(
    type: AccountTypeEnum,
    options?: PaginationOptions,
  ): Promise<Account[]>;
  countByType(type: AccountTypeEnum): Promise<number>;
  findAll(options?: PaginationOptions): Promise<Account[]>;
  countAll(): Promise<number>;
  save(account: Account): Promise<void>;
  delete(id: string): Promise<void>;
  existsByUserId(userId: string): Promise<boolean>;
  existsByOrganizationIdAndEmail(
    organizationId: string,
    email: string,
  ): Promise<boolean>;
  searchByLocation(options: AccountSearchOptions): Promise<AccountSearchResult>;
}
