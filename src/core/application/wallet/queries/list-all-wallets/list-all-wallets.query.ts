export class ListAllWalletsQuery {
  constructor(
    public readonly search?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
