import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RemoveStaffCommand } from './remove-staff.command';
import {
  PARTNER_STAFF_REPOSITORY,
  IPartnerStaffRepository,
} from '../../../../domain/partner/repositories/partner-staff.repository.interface';

@CommandHandler(RemoveStaffCommand)
export class RemoveStaffHandler implements ICommandHandler<RemoveStaffCommand> {
  constructor(
    @Inject(PARTNER_STAFF_REPOSITORY)
    private readonly staffRepository: IPartnerStaffRepository,
  ) {}

  async execute(command: RemoveStaffCommand): Promise<void> {
    // Find the staff to remove
    const staff = await this.staffRepository.findById(command.staffId);
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    // Verify staff belongs to the partner
    if (staff.partnerId !== command.partnerId) {
      throw new NotFoundException('Staff not found');
    }

    // Verify remover has permission
    const remover = await this.staffRepository.findByPartnerIdAndUserId(
      command.partnerId,
      command.removedBy,
    );
    if (!remover) {
      throw new ForbiddenException(
        'You are not a staff member of this partner',
      );
    }
    if (!remover.role.canManageStaff()) {
      throw new ForbiddenException(
        'You do not have permission to remove staff',
      );
    }

    // Cannot remove owner
    if (staff.role.isOwner()) {
      throw new ForbiddenException('Cannot remove the owner');
    }

    // Managers can only remove staff, not other managers
    if (remover.role.isManager() && staff.role.isManager()) {
      throw new ForbiddenException('Managers cannot remove other managers');
    }

    // Delete the staff
    await this.staffRepository.delete(command.staffId);
  }
}
