export class AdminCancelBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly adminId: string,
    public readonly reason: string,
  ) {}
}
