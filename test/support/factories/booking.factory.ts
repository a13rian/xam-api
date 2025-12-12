import { v4 as uuidv4 } from 'uuid';
import { DatabaseHelper } from '../database/database.helper';
import {
  BookingOrmEntity,
  BookingServiceOrmEntity,
} from '../../../src/infrastructure/persistence/typeorm/entities/booking.orm-entity';
import { BookingStatusEnum } from '../../../src/core/domain/booking/value-objects/booking-status.vo';

export interface CreateBookingOptions {
  customerId: string;
  organizationId: string;
  locationId: string;
  staffId?: string;
  status?: BookingStatusEnum;
  scheduledDate?: Date;
  startTime?: string;
  endTime?: string;
  totalAmount?: number;
  paidAmount?: number;
  currency?: string;
  isHomeService?: boolean;
  customerAddress?: string;
  customerPhone?: string;
  customerName?: string;
  notes?: string;
  services?: Array<{
    serviceId: string;
    serviceName: string;
    price: number;
    durationMinutes: number;
  }>;
}

export interface CreatedBooking {
  id: string;
  customerId: string;
  organizationId: string;
  locationId: string;
  status: BookingStatusEnum;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  totalAmount: number;
}

let bookingCounter = 0;

export class BookingFactory {
  constructor(private readonly db: DatabaseHelper) {}

  async create(options: CreateBookingOptions): Promise<CreatedBooking> {
    bookingCounter++;
    const bookingRepo = this.db.getRepository(BookingOrmEntity);
    const bookingServiceRepo = this.db.getRepository(BookingServiceOrmEntity);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookingId = uuidv4();
    const booking = bookingRepo.create({
      id: bookingId,
      customerId: options.customerId,
      organizationId: options.organizationId,
      locationId: options.locationId,
      staffId: options.staffId ?? null,
      status: options.status ?? BookingStatusEnum.PENDING,
      scheduledDate: options.scheduledDate ?? tomorrow,
      startTime: options.startTime ?? '10:00',
      endTime: options.endTime ?? '11:00',
      totalAmount: options.totalAmount ?? 100000,
      paidAmount: options.paidAmount ?? 0,
      currency: options.currency ?? 'VND',
      isHomeService: options.isHomeService ?? false,
      customerAddress: options.customerAddress ?? null,
      customerPhone: options.customerPhone ?? '0901234567',
      customerName: options.customerName ?? `Customer ${bookingCounter}`,
      notes: options.notes ?? null,
    });

    await bookingRepo.save(booking);

    // Create booking services
    if (options.services && options.services.length > 0) {
      for (const service of options.services) {
        const bookingService = bookingServiceRepo.create({
          id: uuidv4(),
          bookingId,
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          price: service.price,
          currency: 'VND',
          durationMinutes: service.durationMinutes,
        });
        await bookingServiceRepo.save(bookingService);
      }
    }

    return {
      id: booking.id,
      customerId: booking.customerId,
      organizationId: booking.organizationId,
      locationId: booking.locationId,
      status: booking.status,
      scheduledDate: booking.scheduledDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalAmount: Number(booking.totalAmount),
    };
  }

  async createConfirmed(
    options: CreateBookingOptions,
  ): Promise<CreatedBooking> {
    return this.create({
      ...options,
      status: BookingStatusEnum.CONFIRMED,
      paidAmount: options.totalAmount ?? 100000,
    });
  }
}
