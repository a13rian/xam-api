import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListPendingAccountsQuery } from './list-pending-accounts.query';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';
import { AccountStatusEnum } from '../../../../domain/account/value-objects/account-status.vo';

export interface PendingAccountItem {
  id: string;
  userId: string;
  type: string;
  displayName: string;
  specialization: string | null;
  yearsExperience: number | null;
  personalBio: string | null;
  portfolio: string | null;
  certifications: string[];
  status: string;
  createdAt: Date;
  rejectionReason: string | null;
}

export interface ListPendingAccountsResult {
  items: PendingAccountItem[];
  total: number;
  page: number;
  limit: number;
}

@QueryHandler(ListPendingAccountsQuery)
export class ListPendingAccountsHandler implements IQueryHandler<ListPendingAccountsQuery> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(
    query: ListPendingAccountsQuery,
  ): Promise<ListPendingAccountsResult> {
    const accounts = await this.accountRepository.findByStatus(
      AccountStatusEnum.PENDING,
      {
        page: query.page,
        limit: query.limit,
      },
    );

    const total = await this.accountRepository.countByStatus(
      AccountStatusEnum.PENDING,
    );

    const items: PendingAccountItem[] = accounts.map((account) => ({
      id: account.id,
      userId: account.userId,
      type: account.typeValue,
      displayName: account.displayName,
      specialization: account.specialization,
      yearsExperience: account.yearsExperience,
      personalBio: account.personalBio,
      portfolio: account.portfolio,
      certifications: account.certifications,
      status: account.statusValue,
      createdAt: account.createdAt,
      rejectionReason: account.rejectionReason,
    }));

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
    };
  }
}
