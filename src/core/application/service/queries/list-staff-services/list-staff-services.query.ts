export class ListStaffServicesQuery {
  constructor(
    public readonly staffId: string,
    public readonly organizationId: string,
  ) {}
}

export class ListServiceStaffQuery {
  constructor(
    public readonly serviceId: string,
    public readonly organizationId: string,
  ) {}
}
