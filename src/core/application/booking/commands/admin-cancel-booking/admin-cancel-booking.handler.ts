import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { AdminCancelBookingCommand } from './admin-cancel-booking.command';
import { Money } from '../../../../domain/shared/value-objects/money.vo';
import {
  BOOKING_REPOSITORY,
  IBookingRepository,
} from '../../../../domain/booking/repositories/booking.repository.interface';
import {
  WALLET_REPOSITORY,
  IWalletRepository,
} from '../../../../domain/wallet/repositories/wallet.repository.interface';
import {
  TIME_SLOT_REPOSITORY,
  ITimeSlotRepository,
} from '../../../../domain/schedule/repositories/time-slot.repository.interface';
import { BookingResponseDto } from '../../../../../presentation/http/dto/booking';

@CommandHandler(AdminCancelBookingCommand)
export class AdminCancelBookingHandler implements ICommandHandler<AdminCancelBookingCommand> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(TIME_SLOT_REPOSITORY)
    private readonly slotRepository: ITimeSlotRepository,
  ) {}

  async execute(
    command: AdminCancelBookingCommand,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if booking can be cancelled
    if (!booking.status.canBeCancelled()) {
      throw new ConflictException(
        'Booking cannot be cancelled in current status',
      );
    }

    // Admin cancel - reason includes admin info
    const cancellationReason = `[Admin: ${command.adminId}] ${command.reason}`;
    booking.cancel(command.adminId, cancellationReason);

    // Calculate and process refund if payment was made
    const refundAmount = booking.calculateRefundAmount();
    if (refundAmount > 0) {
      const wallet = await this.walletRepository.findByUserId(
        booking.customerId,
      );
      if (wallet) {
        const refundMoney = Money.create(refundAmount, booking.currency);
        wallet.refund(
          refundMoney,
          booking.id,
          `Admin refund for cancelled booking ${booking.id}`,
        );
        await this.walletRepository.save(wallet);
      }
    }

    await this.bookingRepository.save(booking);

    // Release any booked time slots
    if (booking.locationId) {
      const slots = await this.slotRepository.findByLocationIdAndDate(
        booking.locationId,
        booking.scheduledDate,
      );
      for (const slot of slots) {
        if (slot.bookingId === booking.id) {
          slot.release();
          await this.slotRepository.save(slot);
        }
      }
    }

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
