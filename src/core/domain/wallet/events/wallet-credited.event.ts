export class WalletCreditedEvent {
  constructor(
    public readonly walletId: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
