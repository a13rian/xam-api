import { Booking } from '../entities/booking.entity';
import { BookingStatusEnum } from '../value-objects/booking-status.vo';

export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');

export interface BookingSearchOptions {
  customerId?: string;
  organizationId?: string;
  locationId?: string;
  status?: BookingStatusEnum;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface BookingSearchResult {
  items: Booking[];
  total: number;
  page: number;
  limit: number;
}

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByCustomerId(customerId: string): Promise<Booking[]>;
  findByOrganizationId(organizationId: string): Promise<Booking[]>;
  search(options: BookingSearchOptions): Promise<BookingSearchResult>;
  save(booking: Booking): Promise<void>;
  delete(id: string): Promise<void>;
}
