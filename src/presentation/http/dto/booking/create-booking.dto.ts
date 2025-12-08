import {
  IsString,
  IsUUID,
  IsDateString,
  IsArray,
  ArrayMinSize,
  IsOptional,
  IsBoolean,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BookingServiceItemDto {
  @IsUUID()
  serviceId: string;
}

export class CreateBookingDto {
  @IsUUID()
  partnerId: string;

  @IsUUID()
  locationId: string;

  @IsOptional()
  @IsUUID()
  staffId?: string;

  @IsDateString()
  scheduledDate: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BookingServiceItemDto)
  services: BookingServiceItemDto[];

  @IsOptional()
  @IsBoolean()
  isHomeService?: boolean;

  @IsOptional()
  @IsString()
  customerAddress?: string;

  @IsString()
  customerPhone: string;

  @IsString()
  customerName: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
