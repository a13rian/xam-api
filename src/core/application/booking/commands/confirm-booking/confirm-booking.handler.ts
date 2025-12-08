import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfirmBookingCommand } from './confirm-booking.command';
import { Money } from '../../../../domain/shared/value-objects/money.vo';
import {
  BOOKING_REPOSITORY,
  IBookingRepository,
} from '../../../../domain/booking/repositories/booking.repository.interface';
import {
  WALLET_REPOSITORY,
  IWalletRepository,
} from '../../../../domain/wallet/repositories/wallet.repository.interface';

@CommandHandler(ConfirmBookingCommand)
export class ConfirmBookingHandler implements ICommandHandler<ConfirmBookingCommand> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
  ) {}

  async execute(command: ConfirmBookingCommand) {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.partnerId !== command.partnerId) {
      throw new NotFoundException('Booking not found');
    }

    // Check if booking can be confirmed
    if (!booking.status.canBeConfirmed()) {
      throw new ConflictException(
        'Booking cannot be confirmed in current status',
      );
    }

    // Get customer wallet (optional - payment can be handled separately)
    const wallet = await this.walletRepository.findByUserId(booking.customerId);

    // If wallet exists and has sufficient balance, deduct payment
    if (wallet) {
      const paymentAmount = Money.create(booking.totalAmount, booking.currency);
      if (wallet.hasSufficientBalance(paymentAmount)) {
        wallet.pay(paymentAmount, booking.id, `Payment for booking ${booking.id}`);
        await this.walletRepository.save(wallet);
        booking.markPaymentReceived(booking.totalAmount);
      }
    }

    // Confirm booking
    booking.confirm();
    await this.bookingRepository.save(booking);

    return booking.toObject();
  }
}
