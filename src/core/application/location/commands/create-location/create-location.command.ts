export class CreateLocationCommand {
  constructor(
    public readonly organizationId: string,
    public readonly name: string,
    public readonly street: string,
    public readonly district: string,
    public readonly city: string,
    public readonly ward?: string,
    public readonly latitude?: number,
    public readonly longitude?: number,
    public readonly phone?: string,
    public readonly isPrimary?: boolean,
  ) {}
}
