import { Injectable } from '@nestjs/common';
import { OperatingHours } from '../../../../core/domain/location/entities/operating-hours.entity';
import { OperatingHoursOrmEntity } from '../entities/operating-hours.orm-entity';

@Injectable()
export class OperatingHoursMapper {
  toDomain(ormEntity: OperatingHoursOrmEntity): OperatingHours {
    return new OperatingHours({
      id: ormEntity.id,
      locationId: ormEntity.locationId,
      dayOfWeek: ormEntity.dayOfWeek,
      openTime: ormEntity.openTime,
      closeTime: ormEntity.closeTime,
      isClosed: ormEntity.isClosed,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  toOrm(domain: OperatingHours): OperatingHoursOrmEntity {
    const props = domain.toObject();
    const ormEntity = new OperatingHoursOrmEntity();
    ormEntity.id = props.id;
    ormEntity.locationId = props.locationId;
    ormEntity.dayOfWeek = props.dayOfWeek;
    ormEntity.openTime = props.openTime;
    ormEntity.closeTime = props.closeTime;
    ormEntity.isClosed = props.isClosed;
    ormEntity.createdAt = props.createdAt;
    ormEntity.updatedAt = props.updatedAt;
    return ormEntity;
  }
}
