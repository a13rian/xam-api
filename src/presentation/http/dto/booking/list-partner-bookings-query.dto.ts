import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';
import { BookingStatusEnum } from '../../../../core/domain/booking/value-objects/booking-status.vo';

export class ListPartnerBookingsQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(BookingStatusEnum)
  status?: BookingStatusEnum;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
