export class WalletCreatedEvent {
  constructor(
    public readonly walletId: string,
    public readonly userId: string,
    public readonly currency: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
