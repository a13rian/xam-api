export class ListUsersQuery {
  constructor(
    public readonly organizationId?: string,
    public readonly page: number = 1,
    public readonly limit: number = 50,
  ) {}
}
