import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { CancelBookingCommand } from './cancel-booking.command';
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

@CommandHandler(CancelBookingCommand)
export class CancelBookingHandler implements ICommandHandler<CancelBookingCommand> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(TIME_SLOT_REPOSITORY)
    private readonly slotRepository: ITimeSlotRepository,
  ) {}

  async execute(command: CancelBookingCommand) {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify permission
    if (command.isOrganization) {
      if (booking.organizationId !== command.cancelledBy) {
        throw new NotFoundException('Booking not found');
      }
    } else {
      if (booking.customerId !== command.cancelledBy) {
        throw new NotFoundException('Booking not found');
      }
    }

    // Check if booking can be cancelled
    if (!booking.status.canBeCancelled()) {
      throw new ConflictException(
        'Booking cannot be cancelled in current status',
      );
    }

    // Cancel booking
    booking.cancel(command.cancelledBy, command.reason ?? '');

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
          `Refund for cancelled booking ${booking.id}`,
        );
        await this.walletRepository.save(wallet);
      }
    }

    await this.bookingRepository.save(booking);

    // Release any booked time slots
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

    return booking.toObject();
  }
}
