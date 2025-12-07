export class OrganizationDeletedEvent {
  constructor(
    public readonly organizationId: string,
    public readonly slug: string,
  ) {}
}
