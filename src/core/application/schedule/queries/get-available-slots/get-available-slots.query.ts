export class GetAvailableSlotsQuery {
  constructor(
    public readonly locationId: string,
    public readonly date: Date,
  ) {}
}
