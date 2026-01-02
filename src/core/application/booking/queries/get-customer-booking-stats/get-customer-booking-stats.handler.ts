import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCustomerBookingStatsQuery } from './get-customer-booking-stats.query';
import {
  BOOKING_REPOSITORY,
  IBookingRepository,
  CustomerStatsResult,
} from '../../../../domain/booking/repositories/booking.repository.interface';

@QueryHandler(GetCustomerBookingStatsQuery)
export class GetCustomerBookingStatsHandler implements IQueryHandler<GetCustomerBookingStatsQuery> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(
    query: GetCustomerBookingStatsQuery,
  ): Promise<CustomerStatsResult> {
    return await this.bookingRepository.getCustomerStats({
      customerId: query.customerId,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }
}
