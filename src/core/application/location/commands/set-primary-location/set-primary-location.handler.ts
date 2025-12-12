import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SetPrimaryLocationCommand } from './set-primary-location.command';
import {
  PARTNER_LOCATION_REPOSITORY,
  IPartnerLocationRepository,
} from '../../../../domain/location/repositories/partner-location.repository.interface';

@CommandHandler(SetPrimaryLocationCommand)
export class SetPrimaryLocationHandler implements ICommandHandler<SetPrimaryLocationCommand> {
  constructor(
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
  ) {}

  async execute(command: SetPrimaryLocationCommand): Promise<void> {
    const location = await this.locationRepository.findById(command.id);
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    if (location.organizationId !== command.organizationId) {
      throw new ForbiddenException('You do not own this location');
    }

    // Clear primary from all other locations
    await this.locationRepository.clearPrimaryForPartner(
      command.organizationId,
      command.id,
    );

    // Set this location as primary
    location.setPrimary(true);
    await this.locationRepository.save(location);
  }
}
