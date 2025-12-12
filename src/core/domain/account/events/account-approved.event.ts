export class AccountApprovedEvent {
  constructor(
    public readonly accountId: string,
    public readonly userId: string,
    public readonly approvedBy: string,
  ) {}
}
