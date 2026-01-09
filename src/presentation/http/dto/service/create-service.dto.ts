import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { BookingTypeEnum } from '../../../../core/domain/service/value-objects/booking-type.vo';

export class CreateServiceDto {
  @IsString()
  categoryId: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsEnum(BookingTypeEnum)
  bookingType: BookingTypeEnum;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
