export interface BookingServiceInput {
  serviceId: string; // Unified: srv_* for Organization, asv_* for Individual
}

export class CreateBookingCommand {
  constructor(
    public readonly customerId: string,
    public readonly accountId: string, // Provider account ID
    public readonly scheduledDate: Date,
    public readonly startTime: string,
    public readonly services: BookingServiceInput[],
    public readonly isHomeService: boolean = false,
    public readonly notes?: string,
  ) {}
}
