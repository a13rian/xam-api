import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetLocationQuery } from './get-location.query';
import {
  PARTNER_LOCATION_REPOSITORY,
  IPartnerLocationRepository,
} from '../../../../domain/location/repositories/partner-location.repository.interface';

export interface LocationResponseDto {
  id: string;
  organizationId: string;
  name: string;
  street: string;
  ward?: string;
  district: string;
  city: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetLocationQuery)
export class GetLocationHandler implements IQueryHandler<GetLocationQuery> {
  constructor(
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
  ) {}

  async execute(query: GetLocationQuery): Promise<LocationResponseDto> {
    const location = await this.locationRepository.findById(query.id);
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    const obj = location.toObject();
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
  }
}
