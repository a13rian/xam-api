import { IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';
import { BookingStatusEnum } from '../../../../core/domain/booking/value-objects/booking-status.vo';

export class ListCustomerBookingsQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(BookingStatusEnum)
  status?: BookingStatusEnum;
}
