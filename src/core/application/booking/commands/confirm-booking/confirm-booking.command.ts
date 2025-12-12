export class ConfirmBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly organizationId: string,
  ) {}
}
