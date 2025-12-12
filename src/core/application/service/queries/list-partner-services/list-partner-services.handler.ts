import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListPartnerServicesQuery } from './list-partner-services.query';
import {
  SERVICE_REPOSITORY,
  IServiceRepository,
} from '../../../../domain/service/repositories/service.repository.interface';
import { ServiceResponseDto } from '../get-service/get-service.handler';

@QueryHandler(ListPartnerServicesQuery)
export class ListPartnerServicesHandler implements IQueryHandler<ListPartnerServicesQuery> {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(
    query: ListPartnerServicesQuery,
  ): Promise<{ items: ServiceResponseDto[]; total: number }> {
    let services = await this.serviceRepository.findByOrganizationId(
      query.organizationId,
    );

    if (!query.includeInactive) {
      services = services.filter((s) => s.isActive);
    }

    return {
      items: services.map((s) => s.toObject()),
      total: services.length,
    };
  }
}
