import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description: string;

  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
