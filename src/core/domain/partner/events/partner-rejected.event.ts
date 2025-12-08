export class PartnerRejectedEvent {
  constructor(
    public readonly partnerId: string,
    public readonly userId: string,
    public readonly rejectedBy: string,
    public readonly reason: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
