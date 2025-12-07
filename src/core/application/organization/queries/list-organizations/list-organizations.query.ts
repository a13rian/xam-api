export class ListOrganizationsQuery {
  constructor(
    public readonly ownerId?: string,
    public readonly page: number = 1,
    public readonly limit: number = 50,
  ) {}
}
