export class UpdateCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly slug?: string,
    public readonly description?: string,
    public readonly iconUrl?: string,
    public readonly sortOrder?: number,
  ) {}
}
