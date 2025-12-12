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
  ACCOUNT_REPOSITORY,
  IAccountRepository,
} from '../../../../domain/account/repositories/account.repository.interface';

@CommandHandler(AssignStaffToServiceCommand)
export class AssignStaffToServiceHandler implements ICommandHandler<AssignStaffToServiceCommand> {
  constructor(
    @Inject(STAFF_SERVICE_REPOSITORY)
    private readonly staffServiceRepository: IStaffServiceRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(command: AssignStaffToServiceCommand): Promise<{ id: string }> {
    // Verify service exists and belongs to organization
    const service = await this.serviceRepository.findById(command.serviceId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    if (service.organizationId !== command.organizationId) {
      throw new ForbiddenException(
        'Service does not belong to this organization',
      );
    }

    // Verify staff account exists and belongs to organization
    const staffAccount = await this.accountRepository.findById(command.staffId);
    if (!staffAccount) {
      throw new NotFoundException('Staff not found');
    }
    if (staffAccount.organizationId !== command.organizationId) {
      throw new ForbiddenException(
        'Staff does not belong to this organization',
      );
    }

    // Verify requester has permission
    const requester =
      await this.accountRepository.findByOrganizationIdAndUserId(
        command.organizationId,
        command.requestedBy,
      );
    if (!requester) {
      throw new ForbiddenException('You are not a member of this organization');
    }
    if (!requester.canManageServices()) {
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
