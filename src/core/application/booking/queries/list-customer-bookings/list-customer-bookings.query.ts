import { BookingStatusEnum } from '../../../../domain/booking/value-objects/booking-status.vo';

export class ListCustomerBookingsQuery {
  constructor(
    public readonly customerId: string,
    public readonly status?: BookingStatusEnum,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
