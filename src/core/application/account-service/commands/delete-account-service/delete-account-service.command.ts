export class DeleteAccountServiceCommand {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
  ) {}
}
