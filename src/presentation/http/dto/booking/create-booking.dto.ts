import {
  IsString,
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
  @IsString()
  serviceId: string; // Unified: accepts both srv_* and asv_*
}

export class CreateBookingDto {
  @IsString()
  accountId: string; // Provider account ID

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
  notes?: string;
}
