import { BookingStatusEnum } from '../../../../domain/booking/value-objects/booking-status.vo';

export class ListAllBookingsQuery {
  constructor(
    public readonly status?: BookingStatusEnum,
    public readonly customerId?: string,
    public readonly organizationId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly search?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
