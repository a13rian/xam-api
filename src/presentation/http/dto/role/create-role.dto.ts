import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
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
  @IsString({ each: true })
  permissionIds: string[];

  @IsOptional()
  @IsString()
  organizationId?: string;
}
