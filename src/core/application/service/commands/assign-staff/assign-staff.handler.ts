import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AssignStaffToServiceCommand } from './assign-staff.command';
import { StaffService } from '../../../../domain/service/entities/staff-service.entity';
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

@CommandHandler(AssignStaffToServiceCommand)
export class AssignStaffToServiceHandler implements ICommandHandler<AssignStaffToServiceCommand> {
  constructor(
    @Inject(STAFF_SERVICE_REPOSITORY)
    private readonly staffServiceRepository: IStaffServiceRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(PARTNER_STAFF_REPOSITORY)
    private readonly staffRepository: IPartnerStaffRepository,
  ) {}

  async execute(command: AssignStaffToServiceCommand): Promise<{ id: string }> {
    // Verify service exists and belongs to partner
    const service = await this.serviceRepository.findById(command.serviceId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    if (service.partnerId !== command.partnerId) {
      throw new ForbiddenException('Service does not belong to this partner');
    }

    // Verify staff exists and belongs to partner
    const staff = await this.staffRepository.findById(command.staffId);
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    if (staff.partnerId !== command.partnerId) {
      throw new ForbiddenException('Staff does not belong to this partner');
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

    // Check if assignment already exists
    const existing =
      await this.staffServiceRepository.findByStaffIdAndServiceId(
        command.staffId,
        command.serviceId,
      );
    if (existing) {
      throw new BadRequestException(
        'Staff is already assigned to this service',
      );
    }

    // Create assignment
    const staffService = StaffService.create({
      staffId: command.staffId,
      serviceId: command.serviceId,
    });

    await this.staffServiceRepository.save(staffService);

    return { id: staffService.id };
  }
}
