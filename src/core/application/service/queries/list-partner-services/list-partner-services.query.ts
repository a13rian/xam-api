export class ListPartnerServicesQuery {
  constructor(
    public readonly partnerId: string,
    public readonly includeInactive: boolean = false,
  ) {}
}
