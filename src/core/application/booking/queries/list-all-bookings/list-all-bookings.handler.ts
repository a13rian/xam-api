import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListAllBookingsQuery } from './list-all-bookings.query';
import {
  BOOKING_REPOSITORY,
  IBookingRepository,
} from '../../../../domain/booking/repositories/booking.repository.interface';
import { BookingsListResponseDto } from '../../../../../presentation/http/dto/booking';

@QueryHandler(ListAllBookingsQuery)
export class ListAllBookingsHandler implements IQueryHandler<ListAllBookingsQuery> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(query: ListAllBookingsQuery): Promise<BookingsListResponseDto> {
    const result = await this.bookingRepository.search({
      customerId: query.customerId,
      organizationId: query.organizationId,
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
          organizationId: props.organizationId ?? '',
          locationId: props.locationId ?? '',
          staffId: props.staffId,
          status: props.status as any,
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
            serviceId: s.serviceId ?? '',
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
