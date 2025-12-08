export class ListCategoriesQuery {
  constructor(
    public readonly includeInactive: boolean = false,
    public readonly parentId?: string | null,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}
