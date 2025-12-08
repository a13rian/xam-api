import { Injectable } from '@nestjs/common';
import { Service } from '../../../../core/domain/service/entities/service.entity';
import { ServiceOrmEntity } from '../entities/service.orm-entity';
import { BookingType } from '../../../../core/domain/service/value-objects/booking-type.vo';
import { Money } from '../../../../core/domain/shared/value-objects/money.vo';

@Injectable()
export class ServiceMapper {
  toDomain(ormEntity: ServiceOrmEntity): Service {
    return new Service({
      id: ormEntity.id,
      partnerId: ormEntity.partnerId,
      categoryId: ormEntity.categoryId,
      name: ormEntity.name,
      description: ormEntity.description,
      price: Money.create(
        Number(ormEntity.priceAmount),
        ormEntity.priceCurrency,
      ),
      durationMinutes: ormEntity.durationMinutes,
      bookingType: BookingType.fromString(ormEntity.bookingType),
      isActive: ormEntity.isActive,
      sortOrder: ormEntity.sortOrder,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  toOrm(domain: Service): ServiceOrmEntity {
    const props = domain.toObject();
    const ormEntity = new ServiceOrmEntity();
    ormEntity.id = props.id;
    ormEntity.partnerId = props.partnerId;
    ormEntity.categoryId = props.categoryId;
    ormEntity.name = props.name;
    ormEntity.description = props.description;
    ormEntity.priceAmount = props.price;
    ormEntity.priceCurrency = props.currency;
    ormEntity.durationMinutes = props.durationMinutes;
    ormEntity.bookingType = props.bookingType as any;
    ormEntity.isActive = props.isActive;
    ormEntity.sortOrder = props.sortOrder;
    ormEntity.createdAt = props.createdAt;
    ormEntity.updatedAt = props.updatedAt;
    return ormEntity;
  }
}
