export class AccountSuspendedEvent {
  constructor(
    public readonly accountId: string,
    public readonly userId: string,
    public readonly reason: string,
  ) {}
}
