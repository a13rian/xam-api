export class RemoveStaffCommand {
  constructor(
    public readonly staffId: string,
    public readonly partnerId: string,
    public readonly removedBy: string,
  ) {}
}
