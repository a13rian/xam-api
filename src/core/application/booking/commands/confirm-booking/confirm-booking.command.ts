export class ConfirmBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly organizationId?: string, // For Business providers
    public readonly accountId?: string, // For Individual providers
  ) {}
}
