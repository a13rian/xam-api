import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateLocationCommand } from './update-location.command';
import {
  PARTNER_LOCATION_REPOSITORY,
  IPartnerLocationRepository,
} from '../../../../domain/location/repositories/partner-location.repository.interface';

@CommandHandler(UpdateLocationCommand)
export class UpdateLocationHandler implements ICommandHandler<UpdateLocationCommand> {
  constructor(
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
  ) {}

  async execute(command: UpdateLocationCommand): Promise<void> {
    const location = await this.locationRepository.findById(command.id);
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Verify ownership - return 404 to not reveal resource existence
    if (location.partnerId !== command.partnerId) {
      throw new NotFoundException('Location not found');
    }

    location.update({
      name: command.name,
      street: command.street,
      ward: command.ward,
      district: command.district,
      city: command.city,
      latitude: command.latitude,
      longitude: command.longitude,
      phone: command.phone,
    });

    await this.locationRepository.save(location);
  }
}
