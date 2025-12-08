import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UnassignStaffFromServiceCommand } from './unassign-staff.command';
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

@CommandHandler(UnassignStaffFromServiceCommand)
export class UnassignStaffFromServiceHandler implements ICommandHandler<UnassignStaffFromServiceCommand> {
  constructor(
    @Inject(STAFF_SERVICE_REPOSITORY)
    private readonly staffServiceRepository: IStaffServiceRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(PARTNER_STAFF_REPOSITORY)
    private readonly staffRepository: IPartnerStaffRepository,
  ) {}

  async execute(command: UnassignStaffFromServiceCommand): Promise<void> {
    // Verify service exists and belongs to partner
    const service = await this.serviceRepository.findById(command.serviceId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    if (service.partnerId !== command.partnerId) {
      throw new ForbiddenException('Service does not belong to this partner');
    }

    // Verify requester has permission
    const requester = await this.staffRepository.findByPartnerIdAndUserId(
      command.partnerId,
      command.requestedBy,
    );
    if (!requester) {
      throw new ForbiddenException(
        'You are not a staff member of this partner',
      );
    }
    if (!requester.role.canManageServices()) {
      throw new ForbiddenException(
        'You do not have permission to manage staff assignments',
      );
    }

    // Check if assignment exists
    const existing =
      await this.staffServiceRepository.findByStaffIdAndServiceId(
        command.staffId,
        command.serviceId,
      );
    if (!existing) {
      throw new NotFoundException('Staff is not assigned to this service');
    }

    // Delete assignment
    await this.staffServiceRepository.deleteByStaffIdAndServiceId(
      command.staffId,
      command.serviceId,
    );
  }
}
