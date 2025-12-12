export class RescheduleBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly requestedBy: string,
    public readonly isOrganization: boolean,
    public readonly newDate: Date,
    public readonly newStartTime: string,
  ) {}
}
