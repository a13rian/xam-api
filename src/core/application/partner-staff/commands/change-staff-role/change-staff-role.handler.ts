import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ChangeStaffRoleCommand } from './change-staff-role.command';
import {
  PARTNER_STAFF_REPOSITORY,
  IPartnerStaffRepository,
} from '../../../../domain/partner/repositories/partner-staff.repository.interface';
import { StaffRoleEnum } from '../../../../domain/partner/value-objects/staff-role.vo';

@CommandHandler(ChangeStaffRoleCommand)
export class ChangeStaffRoleHandler implements ICommandHandler<ChangeStaffRoleCommand> {
  constructor(
    @Inject(PARTNER_STAFF_REPOSITORY)
    private readonly staffRepository: IPartnerStaffRepository,
  ) {}

  async execute(command: ChangeStaffRoleCommand): Promise<void> {
    // Find the staff to update
    const staff = await this.staffRepository.findById(command.staffId);
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    // Verify staff belongs to the partner
    if (staff.partnerId !== command.partnerId) {
      throw new NotFoundException('Staff not found');
    }

    // Cannot change owner role
    if (staff.role.isOwner()) {
      throw new BadRequestException('Cannot change owner role');
    }

    // Cannot change to owner role
    if (command.newRole === StaffRoleEnum.OWNER) {
      throw new BadRequestException('Cannot assign owner role');
    }

    // Verify changer has permission
    const changer = await this.staffRepository.findByPartnerIdAndUserId(
      command.partnerId,
      command.changedBy,
    );
    if (!changer) {
      throw new ForbiddenException(
        'You are not a staff member of this partner',
      );
    }
    if (!changer.role.canManageStaff()) {
      throw new ForbiddenException(
        'You do not have permission to change staff roles',
      );
    }

    // Only owner can promote to manager
    if (command.newRole === StaffRoleEnum.MANAGER && !changer.role.isOwner()) {
      throw new ForbiddenException('Only owner can promote to manager');
    }

    // Change role
    staff.changeRole(command.newRole);
    await this.staffRepository.save(staff);
  }
}
