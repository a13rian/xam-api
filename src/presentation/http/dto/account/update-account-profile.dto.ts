import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  IsEmail,
  IsArray,
  IsObject,
  IsBoolean,
  ValidateNested,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SocialLinksDto {
  @ApiPropertyOptional({ description: 'Facebook profile URL' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  facebook?: string;

  @ApiPropertyOptional({ description: 'Instagram profile URL' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  instagram?: string;

  @ApiPropertyOptional({ description: 'TikTok profile URL' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  tiktok?: string;

  @ApiPropertyOptional({ description: 'Zalo contact number or URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  zalo?: string;

  @ApiPropertyOptional({ description: 'YouTube channel URL' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  youtube?: string;
}

export class ServiceAreaDto {
  @ApiPropertyOptional({ description: 'District name' })
  @IsString()
  @MaxLength(100)
  district: string;

  @ApiPropertyOptional({ description: 'City name' })
  @IsString()
  @MaxLength(100)
  city: string;
}

export class DayScheduleDto {
  @ApiPropertyOptional({ description: 'Opening time (HH:mm)' })
  @IsString()
  @MaxLength(5)
  open: string;

  @ApiPropertyOptional({ description: 'Closing time (HH:mm)' })
  @IsString()
  @MaxLength(5)
  close: string;

  @ApiPropertyOptional({ description: 'Whether the business is open' })
  @IsBoolean()
  isOpen: boolean;
}

export class WorkingHoursDto {
  @ApiPropertyOptional({ type: DayScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  monday?: DayScheduleDto;

  @ApiPropertyOptional({ type: DayScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  tuesday?: DayScheduleDto;

  @ApiPropertyOptional({ type: DayScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  wednesday?: DayScheduleDto;

  @ApiPropertyOptional({ type: DayScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  thursday?: DayScheduleDto;

  @ApiPropertyOptional({ type: DayScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  friday?: DayScheduleDto;

  @ApiPropertyOptional({ type: DayScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  saturday?: DayScheduleDto;

  @ApiPropertyOptional({ type: DayScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  sunday?: DayScheduleDto;
}

export class PriceRangeDto {
  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsNumber()
  @Min(0)
  min: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsNumber()
  @Min(0)
  max: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'VND' })
  @IsString()
  @MaxLength(3)
  currency: string = 'VND';
}

export class UpdateAccountProfileDto {
  // Basic profile fields
  @ApiPropertyOptional({ description: 'Display name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  displayName?: string;

  @ApiPropertyOptional({ description: 'Specialization' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialization?: string;

  @ApiPropertyOptional({ description: 'Portfolio URL or text' })
  @IsOptional()
  @IsString()
  portfolio?: string;

  @ApiPropertyOptional({ description: 'Personal bio' })
  @IsOptional()
  @IsString()
  personalBio?: string;

  // Media fields
  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  coverImageUrl?: string;

  @ApiPropertyOptional({ description: 'Video introduction URL' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  videoIntroUrl?: string;

  // Contact & Social fields
  @ApiPropertyOptional({ description: 'Business phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Business email' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  businessEmail?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  website?: string;

  @ApiPropertyOptional({
    description: 'Social media links',
    type: SocialLinksDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  // Professional/Service fields
  @ApiPropertyOptional({ description: 'Short tagline or slogan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tagline?: string;

  @ApiPropertyOptional({ description: 'Service areas', type: [ServiceAreaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceAreaDto)
  serviceAreas?: ServiceAreaDto[];

  @ApiPropertyOptional({ description: 'Languages spoken' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ description: 'Working hours', type: WorkingHoursDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours?: WorkingHoursDto;

  @ApiPropertyOptional({ description: 'Price range', type: PriceRangeDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PriceRangeDto)
  priceRange?: PriceRangeDto;
}
