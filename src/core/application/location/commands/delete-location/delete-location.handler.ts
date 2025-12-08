import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteLocationCommand } from './delete-location.command';
import {
  PARTNER_LOCATION_REPOSITORY,
  IPartnerLocationRepository,
} from '../../../../domain/location/repositories/partner-location.repository.interface';

@CommandHandler(DeleteLocationCommand)
export class DeleteLocationHandler implements ICommandHandler<DeleteLocationCommand> {
  constructor(
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
  ) {}

  async execute(command: DeleteLocationCommand): Promise<void> {
    const location = await this.locationRepository.findById(command.id);
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    if (location.partnerId !== command.partnerId) {
      throw new NotFoundException('Location not found');
    }

    await this.locationRepository.delete(command.id);
  }
}
