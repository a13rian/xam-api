export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly organizationId: string | null,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
