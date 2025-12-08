export class DeleteLocationCommand {
  constructor(
    public readonly id: string,
    public readonly partnerId: string,
  ) {}
}
