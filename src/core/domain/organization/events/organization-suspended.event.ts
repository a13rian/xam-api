export class OrganizationSuspendedEvent {
  constructor(
    public readonly organizationId: string,
    public readonly reason: string,
  ) {}
}
