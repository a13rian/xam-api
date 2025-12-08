export class ConfirmBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly partnerId: string,
  ) {}
}
