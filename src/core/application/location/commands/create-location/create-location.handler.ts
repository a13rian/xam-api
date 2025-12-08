import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateLocationCommand } from './create-location.command';
import { PartnerLocation } from '../../../../domain/location/entities/partner-location.entity';
import {
  PARTNER_LOCATION_REPOSITORY,
  IPartnerLocationRepository,
} from '../../../../domain/location/repositories/partner-location.repository.interface';
import {
  PARTNER_REPOSITORY,
  IPartnerRepository,
} from '../../../../domain/partner/repositories/partner.repository.interface';

@CommandHandler(CreateLocationCommand)
export class CreateLocationHandler implements ICommandHandler<CreateLocationCommand> {
  constructor(
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute(command: CreateLocationCommand): Promise<{ id: string }> {
    const partner = await this.partnerRepository.findById(command.partnerId);
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }
    if (!partner.status.isActive()) {
      throw new NotFoundException('Partner not found');
    }

    const location = PartnerLocation.create({
      id: uuidv4(),
      partnerId: command.partnerId,
      name: command.name,
      street: command.street,
      ward: command.ward,
      district: command.district,
      city: command.city,
      latitude: command.latitude,
      longitude: command.longitude,
      phone: command.phone,
      isPrimary: command.isPrimary,
    });

    // If this is the primary location, clear other primaries
    if (command.isPrimary) {
      await this.locationRepository.clearPrimaryForPartner(command.partnerId);
    }

    await this.locationRepository.save(location);

    return { id: location.id };
  }
}
