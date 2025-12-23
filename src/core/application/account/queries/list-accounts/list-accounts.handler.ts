import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListAccountsQuery } from './list-accounts.query';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';
import { Account } from '../../../../domain/account/entities/account.entity';

export interface AccountListItem {
  id: string;
  userId: string;
  type: string;
  displayName: string;
  specialization: string | null;
  personalBio: string | null;
  portfolio: string | null;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  rejectionReason: string | null;
  approvedAt: Date | null;
  approvedBy: string | null;
}

export interface ListAccountsResult {
  items: AccountListItem[];
  total: number;
  page: number;
  limit: number;
}

@QueryHandler(ListAccountsQuery)
export class ListAccountsHandler implements IQueryHandler<ListAccountsQuery> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(query: ListAccountsQuery): Promise<ListAccountsResult> {
    let accounts: Account[];
    let total: number;

    // If status filter is provided, use findByStatus
    if (query.status) {
      accounts = await this.accountRepository.findByStatus(query.status, {
        page: query.page,
        limit: query.limit,
      });
      total = await this.accountRepository.countByStatus(query.status);
    }
    // If type filter is provided, use findByType
    else if (query.type) {
      accounts = await this.accountRepository.findByType(query.type, {
        page: query.page,
        limit: query.limit,
      });
      total = await this.accountRepository.countByType(query.type);
    }
    // Otherwise, get all accounts
    else {
      accounts = await this.accountRepository.findAll({
        page: query.page,
        limit: query.limit,
      });
      total = await this.accountRepository.countAll();
    }

    // Apply search filter if provided (client-side filtering for now)
    // TODO: Move search to repository level for better performance
    let filteredAccounts = accounts;
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredAccounts = accounts.filter(
        (account) =>
          account.displayName.toLowerCase().includes(searchLower) ||
          account.specialization?.toLowerCase().includes(searchLower) ||
          account.personalBio?.toLowerCase().includes(searchLower),
      );
    }

    const items: AccountListItem[] = filteredAccounts.map((account) => ({
      id: account.id,
      userId: account.userId,
      type: account.typeValue,
      displayName: account.displayName,
      specialization: account.specialization,
      personalBio: account.personalBio,
      portfolio: account.portfolio,
      status: account.statusValue,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      rejectionReason: account.rejectionReason,
      approvedAt: account.approvedAt,
      approvedBy: account.approvedBy,
    }));

    return {
      items,
      total: query.search ? filteredAccounts.length : total,
      page: query.page,
      limit: query.limit,
    };
  }
}
