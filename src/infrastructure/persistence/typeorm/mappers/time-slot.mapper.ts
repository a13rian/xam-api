import { Injectable } from '@nestjs/common';
import { TimeSlot } from '../../../../core/domain/schedule/entities/time-slot.entity';
import { TimeSlotOrmEntity } from '../entities/time-slot.orm-entity';

@Injectable()
export class TimeSlotMapper {
  toDomain(ormEntity: TimeSlotOrmEntity): TimeSlot {
    return new TimeSlot({
      id: ormEntity.id,
      locationId: ormEntity.locationId,
      staffId: ormEntity.staffId,
      date: new Date(ormEntity.date),
      startTime: ormEntity.startTime,
      endTime: ormEntity.endTime,
      status: ormEntity.status,
      bookingId: ormEntity.bookingId,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  toOrm(domain: TimeSlot): TimeSlotOrmEntity {
    const props = domain.toObject();
    const ormEntity = new TimeSlotOrmEntity();
    ormEntity.id = props.id;
    ormEntity.locationId = props.locationId;
    ormEntity.staffId = props.staffId;
    ormEntity.date = props.date;
    ormEntity.startTime = props.startTime;
    ormEntity.endTime = props.endTime;
    ormEntity.status = props.status;
    ormEntity.bookingId = props.bookingId;
    ormEntity.createdAt = props.createdAt;
    ormEntity.updatedAt = props.updatedAt;
    return ormEntity;
  }
}
