import { StaffRoleEnum } from '../../../../domain/partner/value-objects/staff-role.vo';

export class ChangeStaffRoleCommand {
  constructor(
    public readonly staffId: string,
    public readonly partnerId: string,
    public readonly changedBy: string,
    public readonly newRole: StaffRoleEnum,
  ) {}
}
