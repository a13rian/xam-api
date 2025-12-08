import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetOperatingHoursQuery } from './get-operating-hours.query';
import {
  PARTNER_LOCATION_REPOSITORY,
  IPartnerLocationRepository,
} from '../../../../domain/location/repositories/partner-location.repository.interface';
import {
  OPERATING_HOURS_REPOSITORY,
  IOperatingHoursRepository,
} from '../../../../domain/location/repositories/operating-hours.repository.interface';
import { DayOfWeek } from '../../../../domain/location/entities/operating-hours.entity';

export interface OperatingHoursResponseDto {
  id: string;
  locationId: string;
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

@QueryHandler(GetOperatingHoursQuery)
export class GetOperatingHoursHandler implements IQueryHandler<GetOperatingHoursQuery> {
  constructor(
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
    @Inject(OPERATING_HOURS_REPOSITORY)
    private readonly hoursRepository: IOperatingHoursRepository,
  ) {}

  async execute(
    query: GetOperatingHoursQuery,
  ): Promise<{ items: OperatingHoursResponseDto[] }> {
    const location = await this.locationRepository.findById(query.locationId);
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    const hours = await this.hoursRepository.findByLocationId(query.locationId);

    return {
      items: hours.map((h) => ({
        id: h.id,
        locationId: h.locationId,
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed,
      })),
    };
  }
}
