export class BulkUpdateStatusCommand {
  constructor(
    public readonly ids: string[],
    public readonly isActive: boolean,
    public readonly performedById: string,
  ) {}
}
