import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListPartnerBookingsQuery } from './list-partner-bookings.query';
import {
  BOOKING_REPOSITORY,
  IBookingRepository,
} from '../../../../domain/booking/repositories/booking.repository.interface';
import { BookingsListResponseDto } from '../list-customer-bookings/list-customer-bookings.handler';

@QueryHandler(ListPartnerBookingsQuery)
export class ListPartnerBookingsHandler implements IQueryHandler<ListPartnerBookingsQuery> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(
    query: ListPartnerBookingsQuery,
  ): Promise<BookingsListResponseDto> {
    const result = await this.bookingRepository.search({
      organizationId: query.organizationId,
      accountId: query.accountId,
      status: query.status,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page,
      limit: query.limit,
    });

    return {
      items: result.items.map((b) => {
        const props = b.toObject();
        return {
          id: props.id,
          customerId: props.customerId,
          organizationId: props.organizationId,
          accountId: props.accountId,
          locationId: props.locationId,
          staffId: props.staffId,
          status: props.status,
          scheduledDate: props.scheduledDate,
          startTime: props.startTime,
          endTime: props.endTime,
          totalAmount: props.totalAmount,
          paidAmount: props.paidAmount,
          currency: props.currency,
          isHomeService: props.isHomeService,
          customerAddress: props.customerAddress,
          customerPhone: props.customerPhone,
          customerName: props.customerName,
          notes: props.notes,
          cancellationReason: props.cancellationReason,
          confirmedAt: props.confirmedAt,
          startedAt: props.startedAt,
          completedAt: props.completedAt,
          cancelledAt: props.cancelledAt,
          createdAt: props.createdAt,
          updatedAt: props.updatedAt,
          services: props.services.map((s) => ({
            id: s.id,
            serviceId: s.serviceId,
            accountServiceId: s.accountServiceId,
            serviceName: s.serviceName,
            price: s.price,
            currency: s.currency,
            durationMinutes: s.durationMinutes,
          })),
        };
      }),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
