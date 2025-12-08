import { AggregateRoot } from '@nestjs/cqrs';
import { Address } from '../../shared/value-objects/address.vo';

export interface PartnerLocationProps {
  id: string;
  partnerId: string;
  name: string;
  address: Address;
  phone?: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PartnerLocation extends AggregateRoot {
  private readonly _id: string;
  private readonly _partnerId: string;
  private _name: string;
  private _address: Address;
  private _phone?: string;
  private _isPrimary: boolean;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PartnerLocationProps) {
    super();
    this._id = props.id;
    this._partnerId = props.partnerId;
    this._name = props.name;
    this._address = props.address;
    this._phone = props.phone;
    this._isPrimary = props.isPrimary;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get partnerId(): string {
    return this._partnerId;
  }

  get name(): string {
    return this._name;
  }

  get address(): Address {
    return this._address;
  }

  get phone(): string | undefined {
    return this._phone;
  }

  get isPrimary(): boolean {
    return this._isPrimary;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: {
    id: string;
    partnerId: string;
    name: string;
    street: string;
    ward?: string;
    district: string;
    city: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    isPrimary?: boolean;
  }): PartnerLocation {
    const now = new Date();
    return new PartnerLocation({
      id: props.id,
      partnerId: props.partnerId,
      name: props.name,
      address: Address.create({
        street: props.street,
        ward: props.ward,
        district: props.district,
        city: props.city,
        latitude: props.latitude,
        longitude: props.longitude,
      }),
      phone: props.phone,
      isPrimary: props.isPrimary ?? false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(props: {
    name?: string;
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
  }): void {
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.phone !== undefined) {
      this._phone = props.phone;
    }

    // Update address if any address field is provided
    if (
      props.street !== undefined ||
      props.ward !== undefined ||
      props.district !== undefined ||
      props.city !== undefined ||
      props.latitude !== undefined ||
      props.longitude !== undefined
    ) {
      this._address = Address.create({
        street: props.street ?? this._address.street,
        ward: props.ward ?? this._address.ward ?? undefined,
        district: props.district ?? this._address.district,
        city: props.city ?? this._address.city,
        latitude: props.latitude ?? this._address.latitude ?? undefined,
        longitude: props.longitude ?? this._address.longitude ?? undefined,
      });
    }

    this._updatedAt = new Date();
  }

  setPrimary(isPrimary: boolean): void {
    this._isPrimary = isPrimary;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  toObject(): {
    id: string;
    partnerId: string;
    name: string;
    street: string;
    ward?: string;
    district: string;
    city: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    isPrimary: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      partnerId: this._partnerId,
      name: this._name,
      street: this._address.street,
      ward: this._address.ward ?? undefined,
      district: this._address.district,
      city: this._address.city,
      latitude: this._address.latitude ?? undefined,
      longitude: this._address.longitude ?? undefined,
      phone: this._phone,
      isPrimary: this._isPrimary,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
