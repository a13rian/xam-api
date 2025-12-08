export class PartnerApprovedEvent {
  constructor(
    public readonly partnerId: string,
    public readonly userId: string,
    public readonly approvedBy: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
