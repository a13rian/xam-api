import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { GenerateSlotsCommand } from './generate-slots.command';
import { TimeSlot } from '../../../../domain/schedule/entities/time-slot.entity';
import {
  TIME_SLOT_REPOSITORY,
  ITimeSlotRepository,
} from '../../../../domain/schedule/repositories/time-slot.repository.interface';
import {
  PARTNER_LOCATION_REPOSITORY,
  IPartnerLocationRepository,
} from '../../../../domain/location/repositories/partner-location.repository.interface';
import {
  OPERATING_HOURS_REPOSITORY,
  IOperatingHoursRepository,
} from '../../../../domain/location/repositories/operating-hours.repository.interface';

@CommandHandler(GenerateSlotsCommand)
export class GenerateSlotsHandler implements ICommandHandler<GenerateSlotsCommand> {
  constructor(
    @Inject(TIME_SLOT_REPOSITORY)
    private readonly slotRepository: ITimeSlotRepository,
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
    @Inject(OPERATING_HOURS_REPOSITORY)
    private readonly hoursRepository: IOperatingHoursRepository,
  ) {}

  async execute(command: GenerateSlotsCommand): Promise<{ count: number }> {
    const location = await this.locationRepository.findById(command.locationId);
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Verify ownership - return 404 to not reveal resource existence
    if (location.organizationId !== command.organizationId) {
      throw new NotFoundException('Location not found');
    }

    const operatingHours = await this.hoursRepository.findByLocationId(
      command.locationId,
    );

    // Delete existing slots in the date range (that aren't booked)
    await this.slotRepository.deleteByLocationIdAndDateRange(
      command.locationId,
      command.startDate,
      command.endDate,
    );

    const slots: TimeSlot[] = [];
    const currentDate = new Date(command.startDate);

    while (currentDate <= command.endDate) {
      const dayOfWeek = currentDate.getDay();
      // Convert JS day (0=Sunday) to our format (0=Monday)
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const dayHours = operatingHours.find((h) => h.dayOfWeek === adjustedDay);

      if (dayHours && !dayHours.isClosed) {
        const generatedSlots = this.generateSlotsForDay(
          command.locationId,
          new Date(currentDate),
          dayHours.openTime,
          dayHours.closeTime,
          command.slotDurationMinutes,
          command.staffId,
        );
        slots.push(...generatedSlots);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (slots.length > 0) {
      await this.slotRepository.saveMany(slots);
    }

    return { count: slots.length };
  }

  private generateSlotsForDay(
    locationId: string,
    date: Date,
    openTime: string,
    closeTime: string,
    durationMinutes: number,
    staffId?: string,
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];

    let [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    const closeMinutes = closeHour * 60 + closeMinute;

    while (true) {
      const currentMinutes = openHour * 60 + openMinute;
      const endMinutes = currentMinutes + durationMinutes;

      if (endMinutes > closeMinutes) {
        break;
      }

      const startTime = `${String(openHour).padStart(2, '0')}:${String(openMinute).padStart(2, '0')}`;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

      slots.push(
        TimeSlot.create({
          id: uuidv4(),
          locationId,
          staffId,
          date: new Date(date),
          startTime,
          endTime,
        }),
      );

      openMinute += durationMinutes;
      if (openMinute >= 60) {
        openHour += Math.floor(openMinute / 60);
        openMinute = openMinute % 60;
      }
    }

    return slots;
  }
}
