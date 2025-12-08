export class ToggleServiceCommand {
  constructor(
    public readonly id: string,
    public readonly partnerId: string,
    public readonly isActive: boolean,
  ) {}
}
