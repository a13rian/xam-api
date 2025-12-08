import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { AcceptInvitationCommand } from './accept-invitation.command';
import {
  PARTNER_STAFF_REPOSITORY,
  IPartnerStaffRepository,
} from '../../../../domain/partner/repositories/partner-staff.repository.interface';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../../domain/user/repositories/user.repository.interface';

@CommandHandler(AcceptInvitationCommand)
export class AcceptInvitationHandler implements ICommandHandler<AcceptInvitationCommand> {
  constructor(
    @Inject(PARTNER_STAFF_REPOSITORY)
    private readonly staffRepository: IPartnerStaffRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: AcceptInvitationCommand): Promise<void> {
    // Validate token is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(command.token)) {
      throw new NotFoundException('Invitation not found');
    }

    // Find invitation by token
    const staff = await this.staffRepository.findByInvitationToken(
      command.token,
    );
    if (!staff) {
      throw new NotFoundException('Invitation not found');
    }

    // Validate user exists
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify email matches - return 403 if different user tries to accept
    if (user.email.value.toLowerCase() !== staff.email.toLowerCase()) {
      throw new ForbiddenException('You are not authorized to accept this invitation');
    }

    // Check if invitation can be accepted
    if (!staff.invitationStatus.canBeAccepted()) {
      throw new ConflictException('Invitation has already been accepted or is no longer valid');
    }

    // Check if user is already staff of this partner
    const existing = await this.staffRepository.findByPartnerIdAndUserId(
      staff.partnerId,
      command.userId,
    );
    if (existing) {
      throw new BadRequestException(
        'You are already a staff member of this partner',
      );
    }

    // Accept invitation
    staff.accept(command.userId);
    await this.staffRepository.save(staff);
  }
}
