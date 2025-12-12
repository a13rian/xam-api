export class StartBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly organizationId: string,
  ) {}
}
