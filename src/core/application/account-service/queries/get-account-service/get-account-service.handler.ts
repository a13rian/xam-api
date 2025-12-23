import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetAccountServiceQuery } from './get-account-service.query';
import {
  ACCOUNT_SERVICE_REPOSITORY,
  IAccountServiceRepository,
} from '../../../../domain/account-service/repositories/account-service.repository.interface';

export interface AccountServiceResult {
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
}

@QueryHandler(GetAccountServiceQuery)
export class GetAccountServiceHandler implements IQueryHandler<GetAccountServiceQuery> {
  constructor(
    @Inject(ACCOUNT_SERVICE_REPOSITORY)
    private readonly accountServiceRepository: IAccountServiceRepository,
  ) {}

  async execute(query: GetAccountServiceQuery): Promise<AccountServiceResult> {
    const service = await this.accountServiceRepository.findById(query.id);
    if (!service) {
      throw new NotFoundException('Account service not found');
    }

    return service.toObject();
  }
}
