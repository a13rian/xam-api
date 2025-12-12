export class OrganizationRejectedEvent {
  constructor(
    public readonly organizationId: string,
    public readonly rejectedBy: string,
    public readonly reason: string,
  ) {}
}
