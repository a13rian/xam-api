import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  ListStaffServicesQuery,
  ListServiceStaffQuery,
} from './list-staff-services.query';
import {
  STAFF_SERVICE_REPOSITORY,
  IStaffServiceRepository,
} from '../../../../domain/service/repositories/staff-service.repository.interface';
import {
  SERVICE_REPOSITORY,
  IServiceRepository,
} from '../../../../domain/service/repositories/service.repository.interface';
import {
  ACCOUNT_REPOSITORY,
  IAccountRepository,
} from '../../../../domain/account/repositories/account.repository.interface';

export interface StaffServiceResponseDto {
  id: string;
  staffId: string;
  serviceId: string;
  createdAt: Date;
}

@QueryHandler(ListStaffServicesQuery)
export class ListStaffServicesHandler implements IQueryHandler<ListStaffServicesQuery> {
  constructor(
    @Inject(STAFF_SERVICE_REPOSITORY)
    private readonly staffServiceRepository: IStaffServiceRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(
    query: ListStaffServicesQuery,
  ): Promise<{ items: StaffServiceResponseDto[] }> {
    // Verify staff account exists and belongs to organization
    const staffAccount = await this.accountRepository.findById(query.staffId);
    if (!staffAccount) {
      throw new NotFoundException('Staff not found');
    }
    if (staffAccount.organizationId !== query.organizationId) {
      throw new ForbiddenException(
        'Staff does not belong to this organization',
      );
    }

    const assignments = await this.staffServiceRepository.findByStaffId(
      query.staffId,
    );

    return {
      items: assignments.map((a) => ({
        id: a.id,
        staffId: a.staffId,
        serviceId: a.serviceId,
        createdAt: a.createdAt,
      })),
    };
  }
}

@QueryHandler(ListServiceStaffQuery)
export class ListServiceStaffHandler implements IQueryHandler<ListServiceStaffQuery> {
  constructor(
    @Inject(STAFF_SERVICE_REPOSITORY)
    private readonly staffServiceRepository: IStaffServiceRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(
    query: ListServiceStaffQuery,
  ): Promise<{ items: StaffServiceResponseDto[] }> {
    // Verify service exists and belongs to partner
    const service = await this.serviceRepository.findById(query.serviceId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    if (service.organizationId !== query.organizationId) {
      throw new ForbiddenException(
        'Service does not belong to this organization',
      );
    }

    const assignments = await this.staffServiceRepository.findByServiceId(
      query.serviceId,
    );

    return {
      items: assignments.map((a) => ({
        id: a.id,
        staffId: a.staffId,
        serviceId: a.serviceId,
        createdAt: a.createdAt,
      })),
    };
  }
}
