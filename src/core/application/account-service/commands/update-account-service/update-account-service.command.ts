export class UpdateAccountServiceCommand {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly categoryId?: string,
    public readonly price?: number,
    public readonly currency?: string,
    public readonly durationMinutes?: number,
    public readonly sortOrder?: number,
  ) {}
}
