import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetBookingQuery } from './get-booking.query';
import {
  BOOKING_REPOSITORY,
  IBookingRepository,
} from '../../../../domain/booking/repositories/booking.repository.interface';

export interface BookingServiceResponseDto {
  id: string;
  serviceId?: string;
  accountServiceId?: string;
  serviceName: string;
  price: number;
  currency: string;
  durationMinutes: number;
}

export interface BookingResponseDto {
  id: string;
  customerId: string;
  organizationId?: string;
  accountId?: string;
  locationId?: string;
  staffId?: string;
  status: string;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  isHomeService: boolean;
  customerAddress?: string;
  customerPhone: string;
  customerName: string;
  notes?: string;
  cancellationReason?: string;
  confirmedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  services: BookingServiceResponseDto[];
}

@QueryHandler(GetBookingQuery)
export class GetBookingHandler implements IQueryHandler<GetBookingQuery> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(query: GetBookingQuery): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(query.id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const props = booking.toObject();
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
  }
}
