import { Injectable } from '@nestjs/common';
import { Booking } from '../../../../core/domain/booking/entities/booking.entity';
import { BookingService } from '../../../../core/domain/booking/entities/booking-service.entity';
import { BookingStatus } from '../../../../core/domain/booking/value-objects/booking-status.vo';
import {
  BookingOrmEntity,
  BookingServiceOrmEntity,
} from '../entities/booking.orm-entity';

@Injectable()
export class BookingMapper {
  toDomain(ormEntity: BookingOrmEntity): Booking {
    const services = (ormEntity.services || []).map(
      (s) =>
        new BookingService({
          id: s.id,
          bookingId: s.bookingId,
          serviceId: s.serviceId,
          accountServiceId: s.accountServiceId,
          serviceName: s.serviceName,
          price: Number(s.price),
          currency: s.currency,
          durationMinutes: s.durationMinutes,
        }),
    );

    return new Booking({
      id: ormEntity.id,
      customerId: ormEntity.customerId,
      organizationId: ormEntity.organizationId,
      accountId: ormEntity.accountId,
      locationId: ormEntity.locationId,
      staffId: ormEntity.staffId,
      status: BookingStatus.fromString(ormEntity.status),
      scheduledDate: new Date(ormEntity.scheduledDate),
      startTime: ormEntity.startTime,
      endTime: ormEntity.endTime,
      totalAmount: Number(ormEntity.totalAmount),
      paidAmount: Number(ormEntity.paidAmount),
      currency: ormEntity.currency,
      isHomeService: ormEntity.isHomeService,
      customerAddress: ormEntity.customerAddress,
      customerPhone: ormEntity.customerPhone,
      customerName: ormEntity.customerName,
      notes: ormEntity.notes,
      cancellationReason: ormEntity.cancellationReason,
      cancelledBy: ormEntity.cancelledBy,
      confirmedAt: ormEntity.confirmedAt,
      startedAt: ormEntity.startedAt,
      completedAt: ormEntity.completedAt,
      cancelledAt: ormEntity.cancelledAt,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
      services,
    });
  }

  toOrm(domain: Booking): BookingOrmEntity {
    const props = domain.toObject();
    const ormEntity = new BookingOrmEntity();
    ormEntity.id = props.id;
    ormEntity.customerId = props.customerId;
    ormEntity.organizationId = props.organizationId;
    ormEntity.accountId = props.accountId;
    ormEntity.locationId = props.locationId;
    ormEntity.staffId = props.staffId;
    ormEntity.status = props.status as any;
    ormEntity.scheduledDate = props.scheduledDate;
    ormEntity.startTime = props.startTime;
    ormEntity.endTime = props.endTime;
    ormEntity.totalAmount = props.totalAmount;
    ormEntity.paidAmount = props.paidAmount;
    ormEntity.currency = props.currency;
    ormEntity.isHomeService = props.isHomeService;
    ormEntity.customerAddress = props.customerAddress;
    ormEntity.customerPhone = props.customerPhone;
    ormEntity.customerName = props.customerName;
    ormEntity.notes = props.notes;
    ormEntity.cancellationReason = props.cancellationReason;
    ormEntity.cancelledBy = props.cancelledBy;
    ormEntity.confirmedAt = props.confirmedAt;
    ormEntity.startedAt = props.startedAt;
    ormEntity.completedAt = props.completedAt;
    ormEntity.cancelledAt = props.cancelledAt;
    ormEntity.createdAt = props.createdAt;
    ormEntity.updatedAt = props.updatedAt;

    ormEntity.services = props.services.map((s) => {
      const serviceOrm = new BookingServiceOrmEntity();
      serviceOrm.id = s.id;
      serviceOrm.bookingId = s.bookingId;
      serviceOrm.serviceId = s.serviceId;
      serviceOrm.accountServiceId = s.accountServiceId;
      serviceOrm.serviceName = s.serviceName;
      serviceOrm.price = s.price;
      serviceOrm.currency = s.currency;
      serviceOrm.durationMinutes = s.durationMinutes;
      return serviceOrm;
    });

    return ormEntity;
  }
}
