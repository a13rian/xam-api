import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SearchAccountsByLocationQuery } from './search-accounts-by-location.query';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';
import { SearchAccountsResponseDto } from '../../../../../presentation/http/dto/account/search-accounts-response.dto';

@QueryHandler(SearchAccountsByLocationQuery)
export class SearchAccountsByLocationHandler implements IQueryHandler<SearchAccountsByLocationQuery> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(
    query: SearchAccountsByLocationQuery,
  ): Promise<SearchAccountsResponseDto> {
    const result = await this.accountRepository.searchByLocation({
      latitude: query.latitude,
      longitude: query.longitude,
      radiusKm: query.radiusKm,
      search: query.search,
      city: query.city,
      district: query.district,
      ward: query.ward,
      page: query.page,
      limit: query.limit,
    });

    return {
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    };
  }
}
