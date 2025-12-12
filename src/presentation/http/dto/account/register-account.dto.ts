import {
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumber,
  IsArray,
  IsUrl,
  IsObject,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountTypeEnum } from '../../../../core/domain/account/value-objects/account-type.vo';

export class RegisterAccountDto {
  @IsEnum(AccountTypeEnum)
  type: AccountTypeEnum;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  displayName: string;

  // Individual-specific fields
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialization?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  yearsExperience?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @IsOptional()
  @IsString()
  portfolio?: string;

  @IsOptional()
  @IsString()
  personalBio?: string;

  // Business-specific fields (for creating organization)
  @ValidateIf((o: RegisterAccountDto) => o.type === AccountTypeEnum.BUSINESS)
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  businessName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessLicense?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  companySize?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;

  @IsOptional()
  @IsObject()
  socialMedia?: Record<string, string>;

  @IsOptional()
  @IsDateString()
  establishedDate?: string;
}
