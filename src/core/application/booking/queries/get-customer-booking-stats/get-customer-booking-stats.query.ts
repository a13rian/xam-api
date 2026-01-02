export class GetCustomerBookingStatsQuery {
  constructor(
    public readonly customerId: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
  ) {}
}
