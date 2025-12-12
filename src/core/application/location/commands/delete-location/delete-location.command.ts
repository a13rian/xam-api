export class DeleteLocationCommand {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
  ) {}
}
