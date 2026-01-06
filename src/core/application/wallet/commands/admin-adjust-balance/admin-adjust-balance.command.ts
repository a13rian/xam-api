export class AdminAdjustBalanceCommand {
  constructor(
    public readonly walletId: string,
    public readonly amount: number,
    public readonly reason: string,
    public readonly adminId: string,
  ) {}
}
