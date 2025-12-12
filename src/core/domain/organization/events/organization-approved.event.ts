export class OrganizationApprovedEvent {
  constructor(
    public readonly organizationId: string,
    public readonly approvedBy: string,
  ) {}
}
