import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InviteStaffCommand } from './invite-staff.command';
import { PartnerStaff } from '../../../../domain/partner/entities/partner-staff.entity';
import {
  PARTNER_STAFF_REPOSITORY,
  IPartnerStaffRepository,
} from '../../../../domain/partner/repositories/partner-staff.repository.interface';
import {
  PARTNER_REPOSITORY,
  IPartnerRepository,
} from '../../../../domain/partner/repositories/partner.repository.interface';
import { PartnerTypeEnum } from '../../../../domain/partner/value-objects/partner-type.vo';
import { StaffRoleEnum } from '../../../../domain/partner/value-objects/staff-role.vo';

export interface InviteStaffResult {
  id: string;
  email: string;
  role: string;
  invitationStatus: string;
  invitationToken: string;
}

@CommandHandler(InviteStaffCommand)
export class InviteStaffHandler implements ICommandHandler<InviteStaffCommand> {
  constructor(
    @Inject(PARTNER_STAFF_REPOSITORY)
    private readonly staffRepository: IPartnerStaffRepository,
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute(command: InviteStaffCommand): Promise<InviteStaffResult> {
    // Validate partner exists
    const partner = await this.partnerRepository.findById(command.partnerId);
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // Only organization partners can have staff
    if (partner.type.value !== PartnerTypeEnum.ORGANIZATION) {
      throw new BadRequestException(
        'Only organization partners can invite staff',
      );
    }

    // Verify inviter has permission
    const inviter = await this.staffRepository.findByPartnerIdAndUserId(
      command.partnerId,
      command.invitedBy,
    );
    if (!inviter) {
      throw new ForbiddenException(
        'You are not a staff member of this partner',
      );
    }
    if (!inviter.role.canManageStaff()) {
      throw new ForbiddenException(
        'You do not have permission to invite staff',
      );
    }

    // Cannot invite as owner role
    if (command.role === StaffRoleEnum.OWNER) {
      throw new BadRequestException('Cannot invite staff with owner role');
    }

    // Check if staff already exists
    const existing = await this.staffRepository.findByPartnerIdAndEmail(
      command.partnerId,
      command.email,
    );
    if (existing) {
      throw new ConflictException('Staff with this email already exists');
    }

    // Create invitation
    const staff = PartnerStaff.createInvitation({
      partnerId: command.partnerId,
      email: command.email,
      role: command.role,
    });

    await this.staffRepository.save(staff);

    return {
      id: staff.id,
      email: staff.email,
      role: staff.role.value,
      invitationStatus: staff.invitationStatus.value,
      invitationToken: staff.invitationToken!,
    };
  }
}
