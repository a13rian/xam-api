import { StaffRoleEnum } from '../../../../domain/partner/value-objects/staff-role.vo';

export class InviteStaffCommand {
  constructor(
    public readonly partnerId: string,
    public readonly invitedBy: string,
    public readonly email: string,
    public readonly role: StaffRoleEnum,
  ) {}
}
