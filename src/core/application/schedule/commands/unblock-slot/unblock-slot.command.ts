export class UnblockSlotCommand {
  constructor(
    public readonly slotId: string,
    public readonly organizationId: string,
  ) {}
}
