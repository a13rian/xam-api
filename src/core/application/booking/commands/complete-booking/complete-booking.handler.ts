import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { CompleteBookingCommand } from './complete-booking.command';
import {
  BOOKING_REPOSITORY,
  IBookingRepository,
} from '../../../../domain/booking/repositories/booking.repository.interface';

@CommandHandler(CompleteBookingCommand)
export class CompleteBookingHandler implements ICommandHandler<CompleteBookingCommand> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(command: CompleteBookingCommand) {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.partnerId !== command.partnerId) {
      throw new NotFoundException('Booking not found');
    }

    if (!booking.status.canBeCompleted()) {
      throw new ConflictException(
        'Booking cannot be completed in current status',
      );
    }

    booking.complete();
    await this.bookingRepository.save(booking);

    return booking.toObject();
  }
}
