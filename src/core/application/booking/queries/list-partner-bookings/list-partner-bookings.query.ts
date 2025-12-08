import { BookingStatusEnum } from '../../../../domain/booking/value-objects/booking-status.vo';

export class ListPartnerBookingsQuery {
  constructor(
    public readonly partnerId: string,
    public readonly status?: BookingStatusEnum,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
