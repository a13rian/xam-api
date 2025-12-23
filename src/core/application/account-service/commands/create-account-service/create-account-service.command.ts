export class CreateAccountServiceCommand {
  constructor(
    public readonly accountId: string,
    public readonly categoryId: string,
    public readonly name: string,
    public readonly price: number,
    public readonly durationMinutes: number,
    public readonly description?: string,
    public readonly currency?: string,
    public readonly sortOrder?: number,
  ) {}
}
