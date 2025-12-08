import {
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { PartnerTypeEnum } from '../../../../core/domain/partner/value-objects/partner-type.vo';

export class RegisterPartnerDto {
  @IsEnum(PartnerTypeEnum)
  type: PartnerTypeEnum;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  businessName: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
