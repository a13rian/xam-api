import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetServiceQuery } from './get-service.query';
import {
  SERVICE_REPOSITORY,
  IServiceRepository,
} from '../../../../domain/service/repositories/service.repository.interface';

export interface ServiceResponseDto {
  id: string;
  partnerId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  durationMinutes: number;
  bookingType: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetServiceQuery)
export class GetServiceHandler implements IQueryHandler<GetServiceQuery> {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(query: GetServiceQuery): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findById(query.id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service.toObject();
  }
}
