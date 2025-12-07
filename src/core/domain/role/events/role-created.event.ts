export class RoleCreatedEvent {
  constructor(
    public readonly roleId: string,
    public readonly name: string,
    public readonly organizationId: string | null,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
