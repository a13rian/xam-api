export class ExportUsersQuery {
  constructor(
    public readonly search?: string,
    public readonly isActive?: boolean,
    public readonly roleId?: string,
  ) {}
}
