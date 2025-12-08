import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BlockSlotCommand } from './block-slot.command';
import {
  TIME_SLOT_REPOSITORY,
  ITimeSlotRepository,
} from '../../../../domain/schedule/repositories/time-slot.repository.interface';
import {
  PARTNER_LOCATION_REPOSITORY,
  IPartnerLocationRepository,
} from '../../../../domain/location/repositories/partner-location.repository.interface';

@CommandHandler(BlockSlotCommand)
export class BlockSlotHandler implements ICommandHandler<BlockSlotCommand> {
  constructor(
    @Inject(TIME_SLOT_REPOSITORY)
    private readonly slotRepository: ITimeSlotRepository,
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
  ) {}

  async execute(command: BlockSlotCommand): Promise<void> {
    const slot = await this.slotRepository.findById(command.slotId);
    if (!slot) {
      throw new NotFoundException('Time slot not found');
    }

    const location = await this.locationRepository.findById(slot.locationId);
    if (!location || location.partnerId !== command.partnerId) {
      throw new ForbiddenException('You do not own this time slot');
    }

    slot.block();
    await this.slotRepository.save(slot);
  }
}
