export class AccountRejectedEvent {
  constructor(
    public readonly accountId: string,
    public readonly userId: string,
    public readonly rejectedBy: string,
    public readonly reason: string,
  ) {}
}
