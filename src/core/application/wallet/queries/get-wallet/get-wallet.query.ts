export class GetWalletQuery {
  constructor(
    public readonly id: string,
    public readonly byWalletId: boolean = false,
  ) {}
}
