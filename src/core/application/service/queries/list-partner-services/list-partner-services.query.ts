export class ListPartnerServicesQuery {
  constructor(
    public readonly organizationId: string,
    public readonly includeInactive: boolean = false,
  ) {}
}
