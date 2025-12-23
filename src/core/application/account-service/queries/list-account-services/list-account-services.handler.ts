import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListAccountServicesQuery } from './list-account-services.query';
import {
  ACCOUNT_SERVICE_REPOSITORY,
  IAccountServiceRepository,
} from '../../../../domain/account-service/repositories/account-service.repository.interface';

export interface ListAccountServicesResult {
  items: Array<{
    id: string;
    accountId: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    durationMinutes: number;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
  page: number;
  limit: number;
}

@QueryHandler(ListAccountServicesQuery)
export class ListAccountServicesHandler implements IQueryHandler<ListAccountServicesQuery> {
  constructor(
    @Inject(ACCOUNT_SERVICE_REPOSITORY)
    private readonly accountServiceRepository: IAccountServiceRepository,
  ) {}

  async execute(
    query: ListAccountServicesQuery,
  ): Promise<ListAccountServicesResult> {
    const result = await this.accountServiceRepository.search({
      accountId: query.accountId,
      categoryId: query.categoryId,
      isActive: query.isActive,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return {
      items: result.items.map((service) => service.toObject()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
