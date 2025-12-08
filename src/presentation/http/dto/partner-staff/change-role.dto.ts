import { IsEnum } from 'class-validator';
import { StaffRoleEnum } from '../../../../core/domain/partner/value-objects/staff-role.vo';

export class ChangeRoleDto {
  @IsEnum(StaffRoleEnum)
  role: StaffRoleEnum;
}
