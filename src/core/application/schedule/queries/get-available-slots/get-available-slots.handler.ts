import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetAvailableSlotsQuery } from './get-available-slots.query';
import {
  TIME_SLOT_REPOSITORY,
  ITimeSlotRepository,
} from '../../../../domain/schedule/repositories/time-slot.repository.interface';
import {
  PARTNER_LOCATION_REPOSITORY,
  IPartnerLocationRepository,
} from '../../../../domain/location/repositories/partner-location.repository.interface';
import { TimeSlotStatus } from '../../../../domain/schedule/entities/time-slot.entity';

export interface TimeSlotResponseDto {
  id: string;
  locationId: string;
  staffId?: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: TimeSlotStatus;
}

@QueryHandler(GetAvailableSlotsQuery)
export class GetAvailableSlotsHandler implements IQueryHandler<GetAvailableSlotsQuery> {
  constructor(
    @Inject(TIME_SLOT_REPOSITORY)
    private readonly slotRepository: ITimeSlotRepository,
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
  ) {}

  async execute(
    query: GetAvailableSlotsQuery,
  ): Promise<{ items: TimeSlotResponseDto[] }> {
    const location = await this.locationRepository.findById(query.locationId);
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    const slots = await this.slotRepository.findAvailableByLocationIdAndDate(
      query.locationId,
      query.date,
    );

    return {
      items: slots.map((s) => ({
        id: s.id,
        locationId: s.locationId,
        staffId: s.staffId,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status,
      })),
    };
  }
}
