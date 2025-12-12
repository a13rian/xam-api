export class ApproveOrganizationCommand {
  constructor(
    public readonly organizationId: string,
    public readonly approvedBy: string,
  ) {}
}
