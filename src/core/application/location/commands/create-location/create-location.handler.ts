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
  ORGANIZATION_REPOSITORY,
  IOrganizationRepository,
} from '../../../../domain/organization/repositories/organization.repository.interface';

@CommandHandler(CreateLocationCommand)
export class CreateLocationHandler implements ICommandHandler<CreateLocationCommand> {
  constructor(
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(command: CreateLocationCommand): Promise<{ id: string }> {
    const organization = await this.organizationRepository.findById(
      command.organizationId,
    );
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    if (!organization.status.isActive()) {
      throw new NotFoundException('Organization not found');
    }

    const location = PartnerLocation.create({
      id: uuidv4(),
      organizationId: command.organizationId,
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
      await this.locationRepository.clearPrimaryForPartner(
        command.organizationId,
      );
    }

    await this.locationRepository.save(location);

    return { id: location.id };
  }
}
