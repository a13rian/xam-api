export class UnassignStaffFromServiceCommand {
  constructor(
    public readonly serviceId: string,
    public readonly staffId: string,
    public readonly partnerId: string,
    public readonly requestedBy: string,
  ) {}
}
