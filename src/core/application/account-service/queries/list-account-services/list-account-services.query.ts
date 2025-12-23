export class ListAccountServicesQuery {
  constructor(
    public readonly accountId: string,
    public readonly isActive?: boolean,
    public readonly categoryId?: string,
    public readonly search?: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
