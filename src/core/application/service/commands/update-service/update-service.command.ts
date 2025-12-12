export class UpdateServiceCommand {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly categoryId?: string,
    public readonly price?: number,
    public readonly currency?: string,
    public readonly durationMinutes?: number,
    public readonly sortOrder?: number,
  ) {}
}
