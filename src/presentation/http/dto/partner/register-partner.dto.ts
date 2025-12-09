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
import { PartnerTypeEnum } from '../../../../core/domain/partner/value-objects/partner-type.vo';

export class RegisterPartnerDto {
  @IsEnum(PartnerTypeEnum)
  type: PartnerTypeEnum;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  // Business-specific fields
  @ValidateIf((o: RegisterPartnerDto) => o.type === PartnerTypeEnum.BUSINESS)
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  businessName?: string;

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

  // Individual-specific fields
  @ValidateIf((o: RegisterPartnerDto) => o.type === PartnerTypeEnum.INDIVIDUAL)
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  idCardNumber?: string;

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
}
