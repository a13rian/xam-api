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
  PARTNER_STAFF_REPOSITORY,
  IPartnerStaffRepository,
} from '../../../../domain/partner/repositories/partner-staff.repository.interface';

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
    @Inject(PARTNER_STAFF_REPOSITORY)
    private readonly staffRepository: IPartnerStaffRepository,
  ) {}

  async execute(
    query: ListStaffServicesQuery,
  ): Promise<{ items: StaffServiceResponseDto[] }> {
    // Verify staff exists and belongs to partner
    const staff = await this.staffRepository.findById(query.staffId);
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    if (staff.partnerId !== query.partnerId) {
      throw new ForbiddenException('Staff does not belong to this partner');
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
    if (service.partnerId !== query.partnerId) {
      throw new ForbiddenException('Service does not belong to this partner');
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
