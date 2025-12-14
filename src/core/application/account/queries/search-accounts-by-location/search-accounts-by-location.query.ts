export class SearchAccountsByLocationQuery {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly radiusKm: number,
    public readonly search?: string,
    public readonly city?: string,
    public readonly district?: string,
    public readonly ward?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
