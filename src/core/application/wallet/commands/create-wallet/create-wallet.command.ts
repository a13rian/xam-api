export class CreateWalletCommand {
  constructor(
    public readonly userId: string,
    public readonly currency: string = 'VND',
  ) {}
}
