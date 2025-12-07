export class UserDeletedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly organizationId: string | null,
  ) {}
}
