import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { GenderEnum } from '../../../../core/domain/user/value-objects/gender.vo';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;
}
