import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListPartnerLocationsQuery } from './list-partner-locations.query';
import {
  PARTNER_LOCATION_REPOSITORY,
  IPartnerLocationRepository,
} from '../../../../domain/location/repositories/partner-location.repository.interface';
import { LocationResponseDto } from '../get-location/get-location.handler';

@QueryHandler(ListPartnerLocationsQuery)
export class ListPartnerLocationsHandler implements IQueryHandler<ListPartnerLocationsQuery> {
  constructor(
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
  ) {}

  async execute(
    query: ListPartnerLocationsQuery,
  ): Promise<{ items: LocationResponseDto[]; total: number }> {
    const locations = await this.locationRepository.findByPartnerId(
      query.organizationId,
    );

    return {
      items: locations.map((l) => {
        const obj = l.toObject();
        return {
          id: obj.id,
          organizationId: obj.organizationId,
          name: obj.name,
          street: obj.street,
          ward: obj.ward,
          district: obj.district,
          city: obj.city,
          latitude: obj.latitude,
          longitude: obj.longitude,
          phone: obj.phone,
          isPrimary: obj.isPrimary,
          isActive: obj.isActive,
          createdAt: obj.createdAt,
          updatedAt: obj.updatedAt,
        };
      }),
      total: locations.length,
    };
  }
}
