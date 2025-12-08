import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { RescheduleBookingCommand } from './reschedule-booking.command';
import {
  BOOKING_REPOSITORY,
  IBookingRepository,
} from '../../../../domain/booking/repositories/booking.repository.interface';
import {
  SERVICE_REPOSITORY,
  IServiceRepository,
} from '../../../../domain/service/repositories/service.repository.interface';

@CommandHandler(RescheduleBookingCommand)
export class RescheduleBookingHandler implements ICommandHandler<RescheduleBookingCommand> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(command: RescheduleBookingCommand): Promise<void> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify permission
    if (command.isPartner) {
      if (booking.partnerId !== command.requestedBy) {
        throw new ForbiddenException('You do not own this booking');
      }
    } else {
      if (booking.customerId !== command.requestedBy) {
        throw new ForbiddenException('You do not own this booking');
      }
    }

    // Check if booking can be rescheduled
    if (!booking.canBeRescheduled()) {
      throw new BadRequestException(
        'Booking cannot be rescheduled in current status',
      );
    }

    // Calculate total duration from services
    let totalDuration = 0;
    const props = booking.toObject();
    for (const service of props.services) {
      totalDuration += service.durationMinutes;
    }

    // Calculate end time
    const [startHour, startMinute] = command.newStartTime
      .split(':')
      .map(Number);
    const endMinutes = startHour * 60 + startMinute + totalDuration;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const newEndTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    // Reschedule booking
    booking.reschedule(command.newDate, command.newStartTime, newEndTime);
    await this.bookingRepository.save(booking);
  }
}
