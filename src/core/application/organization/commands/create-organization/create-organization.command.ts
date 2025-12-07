export class CreateOrganizationCommand {
  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly ownerId: string,
    public readonly description?: string,
  ) {}
}
