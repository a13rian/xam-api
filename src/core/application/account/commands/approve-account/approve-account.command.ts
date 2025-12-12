export class ApproveAccountCommand {
  constructor(
    public readonly accountId: string,
    public readonly approvedBy: string,
  ) {}
}
