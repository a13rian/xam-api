import { BookingStatusEnum } from '../../../../domain/booking/value-objects/booking-status.vo';

export class ListPartnerBookingsQuery {
  constructor(
    public readonly organizationId?: string, // For Business providers
    public readonly accountId?: string, // For Individual providers
    public readonly status?: BookingStatusEnum,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
