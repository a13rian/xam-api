export class ListStaffServicesQuery {
  constructor(
    public readonly staffId: string,
    public readonly partnerId: string,
  ) {}
}

export class ListServiceStaffQuery {
  constructor(
    public readonly serviceId: string,
    public readonly partnerId: string,
  ) {}
}
