import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { AdminUpdateBookingStatusCommand } from './admin-update-booking-status.command';
import {
  BOOKING_REPOSITORY,
  IBookingRepository,
} from '../../../../domain/booking/repositories/booking.repository.interface';
import { BookingStatusEnum } from '../../../../domain/booking/value-objects/booking-status.vo';
import { BookingResponseDto } from '../../../../../presentation/http/dto/booking';

@CommandHandler(AdminUpdateBookingStatusCommand)
export class AdminUpdateBookingStatusHandler implements ICommandHandler<AdminUpdateBookingStatusCommand> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(
    command: AdminUpdateBookingStatusCommand,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Admin can force status transitions
    switch (command.status) {
      case BookingStatusEnum.CONFIRMED:
        if (!booking.status.canBeConfirmed()) {
          throw new BadRequestException(
            `Cannot transition from ${booking.status.value} to confirmed`,
          );
        }
        booking.confirm();
        break;

      case BookingStatusEnum.IN_PROGRESS:
        if (!booking.status.canBeStarted()) {
          throw new BadRequestException(
            `Cannot transition from ${booking.status.value} to in_progress`,
          );
        }
        booking.start();
        break;

      case BookingStatusEnum.COMPLETED:
        if (!booking.status.canBeCompleted()) {
          throw new BadRequestException(
            `Cannot transition from ${booking.status.value} to completed`,
          );
        }
        booking.complete();
        break;

      case BookingStatusEnum.CANCELLED:
        if (!booking.status.canBeCancelled()) {
          throw new BadRequestException(
            `Cannot transition from ${booking.status.value} to cancelled`,
          );
        }
        booking.cancel(command.adminId, 'Cancelled by admin');
        break;

      default:
        throw new BadRequestException(`Invalid status: ${command.status}`);
    }

    await this.bookingRepository.save(booking);

    const props = booking.toObject();
    return {
      id: props.id,
      customerId: props.customerId,
      organizationId: props.organizationId!,
      locationId: props.locationId!,
      staffId: props.staffId,
      status: booking.status.value as any,
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
  }
}
