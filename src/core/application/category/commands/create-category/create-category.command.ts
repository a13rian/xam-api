export class CreateCategoryCommand {
  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly description?: string,
    public readonly parentId?: string,
    public readonly iconUrl?: string,
    public readonly sortOrder?: number,
  ) {}
}
