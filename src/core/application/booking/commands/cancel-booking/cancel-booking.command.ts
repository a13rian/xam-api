export class CancelBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly cancelledBy: string,
    public readonly reason?: string,
    public readonly isOrganization: boolean = false,
  ) {}
}
