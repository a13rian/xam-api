import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export interface AddressProps {
  street: string;
  ward?: string;
  district: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export class Address {
  private readonly _street: string;
  private readonly _ward: string | null;
  private readonly _district: string;
  private readonly _city: string;
  private readonly _latitude: number | null;
  private readonly _longitude: number | null;

  private constructor(props: AddressProps) {
    this._street = props.street;
    this._ward = props.ward ?? null;
    this._district = props.district;
    this._city = props.city;
    this._latitude = props.latitude ?? null;
    this._longitude = props.longitude ?? null;
  }

  public static create(props: AddressProps): Address {
    if (!props.street || props.street.trim().length === 0) {
      throw new ValidationException('Street address is required');
    }
    if (!props.district || props.district.trim().length === 0) {
      throw new ValidationException('District is required');
    }
    if (!props.city || props.city.trim().length === 0) {
      throw new ValidationException('City is required');
    }

    if (props.latitude !== undefined && props.longitude === undefined) {
      throw new ValidationException(
        'Longitude is required when latitude is provided',
      );
    }
    if (props.longitude !== undefined && props.latitude === undefined) {
      throw new ValidationException(
        'Latitude is required when longitude is provided',
      );
    }

    if (props.latitude !== undefined) {
      if (props.latitude < -90 || props.latitude > 90) {
        throw new ValidationException('Latitude must be between -90 and 90');
      }
    }
    if (props.longitude !== undefined) {
      if (props.longitude < -180 || props.longitude > 180) {
        throw new ValidationException('Longitude must be between -180 and 180');
      }
    }

    return new Address({
      street: props.street.trim(),
      ward: props.ward?.trim(),
      district: props.district.trim(),
      city: props.city.trim(),
      latitude: props.latitude,
      longitude: props.longitude,
    });
  }

  public hasCoordinates(): boolean {
    return this._latitude !== null && this._longitude !== null;
  }

  public distanceTo(other: Address): number | null {
    if (!this.hasCoordinates() || !other.hasCoordinates()) {
      return null;
    }

    const R = 6371; // Earth's radius in kilometers
    const lat1 = this._latitude! * (Math.PI / 180);
    const lat2 = other._latitude! * (Math.PI / 180);
    const deltaLat = (other._latitude! - this._latitude!) * (Math.PI / 180);
    const deltaLon = (other._longitude! - this._longitude!) * (Math.PI / 180);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
  }

  public distanceToCoordinates(
    latitude: number,
    longitude: number,
  ): number | null {
    if (!this.hasCoordinates()) {
      return null;
    }

    const R = 6371;
    const lat1 = this._latitude! * (Math.PI / 180);
    const lat2 = latitude * (Math.PI / 180);
    const deltaLat = (latitude - this._latitude!) * (Math.PI / 180);
    const deltaLon = (longitude - this._longitude!) * (Math.PI / 180);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  public equals(other: Address): boolean {
    return (
      this._street === other._street &&
      this._ward === other._ward &&
      this._district === other._district &&
      this._city === other._city &&
      this._latitude === other._latitude &&
      this._longitude === other._longitude
    );
  }

  get street(): string {
    return this._street;
  }

  get ward(): string | null {
    return this._ward;
  }

  get district(): string {
    return this._district;
  }

  get city(): string {
    return this._city;
  }

  get latitude(): number | null {
    return this._latitude;
  }

  get longitude(): number | null {
    return this._longitude;
  }

  get fullAddress(): string {
    const parts = [this._street];
    if (this._ward) {
      parts.push(this._ward);
    }
    parts.push(this._district, this._city);
    return parts.join(', ');
  }

  toJSON(): AddressProps {
    return {
      street: this._street,
      ward: this._ward ?? undefined,
      district: this._district,
      city: this._city,
      latitude: this._latitude ?? undefined,
      longitude: this._longitude ?? undefined,
    };
  }
}
