export class DeleteServiceCommand {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
  ) {}
}
