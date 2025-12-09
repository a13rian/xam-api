export class PartnerRegisteredEvent {
  constructor(
    public readonly partnerId: string,
    public readonly userId: string,
    public readonly type: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
