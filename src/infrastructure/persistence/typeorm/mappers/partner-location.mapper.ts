import { Injectable } from '@nestjs/common';
import { PartnerLocation } from '../../../../core/domain/location/entities/partner-location.entity';
import { OrganizationLocationOrmEntity } from '../entities/organization-location.orm-entity';
import { Address } from '../../../../core/domain/shared/value-objects/address.vo';

@Injectable()
export class PartnerLocationMapper {
  toDomain(ormEntity: OrganizationLocationOrmEntity): PartnerLocation {
    return new PartnerLocation({
      id: ormEntity.id,
      organizationId: ormEntity.organizationId,
      name: ormEntity.name,
      address: Address.create({
        street: ormEntity.street,
        ward: ormEntity.ward,
        district: ormEntity.district,
        city: ormEntity.city,
        latitude: ormEntity.latitude ? Number(ormEntity.latitude) : undefined,
        longitude: ormEntity.longitude
          ? Number(ormEntity.longitude)
          : undefined,
      }),
      phone: ormEntity.phone,
      isPrimary: ormEntity.isPrimary,
      isActive: ormEntity.isActive,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  toOrm(domain: PartnerLocation): OrganizationLocationOrmEntity {
    const props = domain.toObject();
    const ormEntity = new OrganizationLocationOrmEntity();
    ormEntity.id = props.id;
    ormEntity.organizationId = props.organizationId;
    ormEntity.name = props.name;
    ormEntity.street = props.street;
    ormEntity.ward = props.ward;
    ormEntity.district = props.district;
    ormEntity.city = props.city;
    ormEntity.latitude = props.latitude;
    ormEntity.longitude = props.longitude;
    ormEntity.phone = props.phone;
    ormEntity.isPrimary = props.isPrimary;
    ormEntity.isActive = props.isActive;
    ormEntity.createdAt = props.createdAt;
    ormEntity.updatedAt = props.updatedAt;
    return ormEntity;
  }
}
