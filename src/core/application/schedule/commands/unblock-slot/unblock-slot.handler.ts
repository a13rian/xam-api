import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UnblockSlotCommand } from './unblock-slot.command';
import {
  TIME_SLOT_REPOSITORY,
  ITimeSlotRepository,
} from '../../../../domain/schedule/repositories/time-slot.repository.interface';
import {
  PARTNER_LOCATION_REPOSITORY,
  IPartnerLocationRepository,
} from '../../../../domain/location/repositories/partner-location.repository.interface';

@CommandHandler(UnblockSlotCommand)
export class UnblockSlotHandler implements ICommandHandler<UnblockSlotCommand> {
  constructor(
    @Inject(TIME_SLOT_REPOSITORY)
    private readonly slotRepository: ITimeSlotRepository,
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
  ) {}

  async execute(command: UnblockSlotCommand): Promise<void> {
    const slot = await this.slotRepository.findById(command.slotId);
    if (!slot) {
      throw new NotFoundException('Time slot not found');
    }

    const location = await this.locationRepository.findById(slot.locationId);
    if (!location || location.partnerId !== command.partnerId) {
      throw new ForbiddenException('You do not own this time slot');
    }

    slot.unblock();
    await this.slotRepository.save(slot);
  }
}
