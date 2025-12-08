export class GetSlotsByDateRangeQuery {
  constructor(
    public readonly locationId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
  ) {}
}
