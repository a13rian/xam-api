export class RoleDeletedEvent {
  constructor(
    public readonly roleId: string,
    public readonly roleName: string,
    public readonly organizationId: string | null,
  ) {}
}
