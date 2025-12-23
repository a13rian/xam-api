export class ToggleAccountServiceCommand {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly isActive: boolean,
  ) {}
}
