import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListServicesQuery } from './list-services.query';
import {
  SERVICE_REPOSITORY,
  IServiceRepository,
} from '../../../../domain/service/repositories/service.repository.interface';
import { ServiceResponseDto } from '../get-service/get-service.handler';

export interface ServicesListResponseDto {
  items: ServiceResponseDto[];
  total: number;
  page: number;
  limit: number;
}

@QueryHandler(ListServicesQuery)
export class ListServicesHandler implements IQueryHandler<ListServicesQuery> {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(query: ListServicesQuery): Promise<ServicesListResponseDto> {
    const result = await this.serviceRepository.search({
      partnerId: query.partnerId,
      categoryId: query.categoryId,
      isActive: query.isActive,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return {
      items: result.items.map((s) => s.toObject()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
