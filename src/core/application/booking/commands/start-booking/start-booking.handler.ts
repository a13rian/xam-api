import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { StartBookingCommand } from './start-booking.command';
import {
  BOOKING_REPOSITORY,
  IBookingRepository,
} from '../../../../domain/booking/repositories/booking.repository.interface';

@CommandHandler(StartBookingCommand)
export class StartBookingHandler implements ICommandHandler<StartBookingCommand> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(command: StartBookingCommand) {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.partnerId !== command.partnerId) {
      throw new NotFoundException('Booking not found');
    }

    if (!booking.status.canBeStarted()) {
      throw new ConflictException(
        'Booking cannot be started in current status',
      );
    }

    booking.start();
    await this.bookingRepository.save(booking);

    return booking.toObject();
  }
}
