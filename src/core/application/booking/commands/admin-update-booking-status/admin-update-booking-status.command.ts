import { BookingStatusEnum } from '../../../../domain/booking/value-objects/booking-status.vo';

export class AdminUpdateBookingStatusCommand {
  constructor(
    public readonly bookingId: string,
    public readonly status: BookingStatusEnum,
    public readonly adminId: string,
  ) {}
}
