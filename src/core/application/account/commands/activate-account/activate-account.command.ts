export class ActivateAccountCommand {
  constructor(
    public readonly accountId: string,
    public readonly activatedBy: string,
  ) {}
}
