export class RejectAccountCommand {
  constructor(
    public readonly accountId: string,
    public readonly rejectedBy: string,
    public readonly reason: string,
  ) {}
}
