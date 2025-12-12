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
  ACCOUNT_REPOSITORY,
  IAccountRepository,
} from '../../../../domain/account/repositories/account.repository.interface';

@CommandHandler(UnassignStaffFromServiceCommand)
export class UnassignStaffFromServiceHandler implements ICommandHandler<UnassignStaffFromServiceCommand> {
  constructor(
    @Inject(STAFF_SERVICE_REPOSITORY)
    private readonly staffServiceRepository: IStaffServiceRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(command: UnassignStaffFromServiceCommand): Promise<void> {
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
