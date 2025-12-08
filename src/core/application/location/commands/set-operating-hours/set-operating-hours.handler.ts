import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { SetOperatingHoursCommand } from './set-operating-hours.command';
import { OperatingHours } from '../../../../domain/location/entities/operating-hours.entity';
import {
  PARTNER_LOCATION_REPOSITORY,
  IPartnerLocationRepository,
} from '../../../../domain/location/repositories/partner-location.repository.interface';
import {
  OPERATING_HOURS_REPOSITORY,
  IOperatingHoursRepository,
} from '../../../../domain/location/repositories/operating-hours.repository.interface';

@CommandHandler(SetOperatingHoursCommand)
export class SetOperatingHoursHandler implements ICommandHandler<SetOperatingHoursCommand> {
  constructor(
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
    @Inject(OPERATING_HOURS_REPOSITORY)
    private readonly hoursRepository: IOperatingHoursRepository,
  ) {}

  async execute(command: SetOperatingHoursCommand): Promise<void> {
    const location = await this.locationRepository.findById(command.locationId);
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    if (location.partnerId !== command.partnerId) {
      throw new ForbiddenException('You do not own this location');
    }

    // Delete existing hours
    await this.hoursRepository.deleteByLocationId(command.locationId);

    // Create new operating hours
    const operatingHours = command.hours.map((h) =>
      OperatingHours.create({
        id: uuidv4(),
        locationId: command.locationId,
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed,
      }),
    );

    await this.hoursRepository.saveMany(operatingHours);
  }
}
