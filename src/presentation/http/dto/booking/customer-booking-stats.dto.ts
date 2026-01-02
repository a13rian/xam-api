import { IsOptional, IsDateString } from 'class-validator';
import { BookingStatusEnum } from '../../../../core/domain/booking/value-objects/booking-status.vo';

export class CustomerBookingStatsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class BookingsByStatusDto {
  status: BookingStatusEnum;
  count: number;
}

export class ServiceUsageDto {
  serviceId: string;
  serviceName: string;
  count: number;
  totalSpent: number;
}

export class MonthlyTrendDto {
  month: string;
  bookingCount: number;
  totalSpent: number;
}

export class CustomerBookingStatsResponseDto {
  totalBookings: number;
  totalSpent: number;
  currency: string;
  bookingsByStatus: BookingsByStatusDto[];
  topServices: ServiceUsageDto[];
  monthlyTrends: MonthlyTrendDto[];
  averageBookingValue: number;
}
