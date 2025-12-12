export class ToggleServiceCommand {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly isActive: boolean,
  ) {}
}
