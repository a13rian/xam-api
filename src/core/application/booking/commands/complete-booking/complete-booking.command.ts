export class CompleteBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly partnerId: string,
  ) {}
}
