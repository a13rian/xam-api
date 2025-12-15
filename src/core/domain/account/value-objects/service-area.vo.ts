import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export interface ServiceAreaData {
  district: string;
  city: string;
}

export class ServiceArea {
  private readonly _district: string;
  private readonly _city: string;

  private constructor(district: string, city: string) {
    this._district = district;
    this._city = city;
  }

  public static create(district: string, city: string): ServiceArea {
    if (!district || district.trim().length === 0) {
      throw new ValidationException('District is required for service area');
    }
    if (!city || city.trim().length === 0) {
      throw new ValidationException('City is required for service area');
    }
    return new ServiceArea(district.trim(), city.trim());
  }

  public static fromData(data: ServiceAreaData): ServiceArea {
    return ServiceArea.create(data.district, data.city);
  }

  public static fromArray(data: ServiceAreaData[]): ServiceArea[] {
    return data.map((item) => ServiceArea.fromData(item));
  }

  get district(): string {
    return this._district;
  }

  get city(): string {
    return this._city;
  }

  public toJSON(): ServiceAreaData {
    return {
      district: this._district,
      city: this._city,
    };
  }

  public equals(other: ServiceArea): boolean {
    return this._district === other._district && this._city === other._city;
  }

  public toString(): string {
    return `${this._district}, ${this._city}`;
  }
}
