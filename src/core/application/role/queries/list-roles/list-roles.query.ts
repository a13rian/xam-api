export class ListRolesQuery {
  constructor(
    public readonly organizationId?: string | null,
    public readonly includeSystemRoles: boolean = true,
  ) {}
}
