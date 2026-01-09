export class DeleteAccountCommand {
  constructor(
    public readonly accountId: string,
    public readonly deletedBy: string,
  ) {}
}
