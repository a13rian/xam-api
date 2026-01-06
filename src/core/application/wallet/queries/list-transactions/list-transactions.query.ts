export class ListTransactionsQuery {
  constructor(
    public readonly id: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly byWalletId: boolean = false,
  ) {}
}
