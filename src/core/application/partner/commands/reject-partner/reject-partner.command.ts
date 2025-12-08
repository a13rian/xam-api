export class RejectPartnerCommand {
  constructor(
    public readonly partnerId: string,
    public readonly rejectedBy: string,
    public readonly reason: string,
  ) {}
}
