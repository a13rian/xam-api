import { IsEmail, IsEnum } from 'class-validator';
import { StaffRoleEnum } from '../../../../core/domain/partner/value-objects/staff-role.vo';

export class InviteStaffDto {
  @IsEmail()
  email: string;

  @IsEnum(StaffRoleEnum)
  role: StaffRoleEnum;
}
