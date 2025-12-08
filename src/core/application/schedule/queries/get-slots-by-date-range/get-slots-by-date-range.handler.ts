import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetSlotsByDateRangeQuery } from './get-slots-by-date-range.query';
import {
  TIME_SLOT_REPOSITORY,
  ITimeSlotRepository,
} from '../../../../domain/schedule/repositories/time-slot.repository.interface';
import {
  PARTNER_LOCATION_REPOSITORY,
  IPartnerLocationRepository,
} from '../../../../domain/location/repositories/partner-location.repository.interface';
import { TimeSlotResponseDto } from '../get-available-slots/get-available-slots.handler';

@QueryHandler(GetSlotsByDateRangeQuery)
export class GetSlotsByDateRangeHandler implements IQueryHandler<GetSlotsByDateRangeQuery> {
  constructor(
    @Inject(TIME_SLOT_REPOSITORY)
    private readonly slotRepository: ITimeSlotRepository,
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
  ) {}

  async execute(
    query: GetSlotsByDateRangeQuery,
  ): Promise<{ items: TimeSlotResponseDto[] }> {
    const location = await this.locationRepository.findById(query.locationId);
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    const slots = await this.slotRepository.findByLocationIdAndDateRange(
      query.locationId,
      query.startDate,
      query.endDate,
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
