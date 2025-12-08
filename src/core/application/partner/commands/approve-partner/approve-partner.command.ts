export class ApprovePartnerCommand {
  constructor(
    public readonly partnerId: string,
    public readonly approvedBy: string,
  ) {}
}
