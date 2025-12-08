export class StartBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly partnerId: string,
  ) {}
}
