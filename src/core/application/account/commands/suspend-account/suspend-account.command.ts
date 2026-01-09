export class SuspendAccountCommand {
  constructor(
    public readonly accountId: string,
    public readonly suspendedBy: string,
    public readonly reason: string,
  ) {}
}
