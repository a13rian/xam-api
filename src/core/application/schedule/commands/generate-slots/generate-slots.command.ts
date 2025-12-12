export class GenerateSlotsCommand {
  constructor(
    public readonly locationId: string,
    public readonly organizationId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly slotDurationMinutes: number,
    public readonly staffId?: string,
  ) {}
}
