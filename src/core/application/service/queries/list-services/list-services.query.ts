export class ListServicesQuery {
  constructor(
    public readonly organizationId?: string,
    public readonly categoryId?: string,
    public readonly isActive?: boolean,
    public readonly search?: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
