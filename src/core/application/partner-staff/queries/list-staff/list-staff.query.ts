export class ListStaffQuery {
  constructor(
    public readonly partnerId: string,
    public readonly requestedBy: string,
  ) {}
}
