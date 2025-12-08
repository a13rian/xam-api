export interface BookingServiceInput {
  serviceId: string;
}

export class CreateBookingCommand {
  constructor(
    public readonly customerId: string,
    public readonly partnerId: string,
    public readonly locationId: string,
    public readonly scheduledDate: Date,
    public readonly startTime: string,
    public readonly services: BookingServiceInput[],
    public readonly customerPhone?: string,
    public readonly customerName?: string,
    public readonly staffId?: string,
    public readonly isHomeService?: boolean,
    public readonly customerAddress?: string,
    public readonly notes?: string,
  ) {}
}
