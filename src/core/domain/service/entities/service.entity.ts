import { AggregateRoot } from '@nestjs/cqrs';
import { BookingType, BookingTypeEnum } from '../value-objects/booking-type.vo';
import { Money } from '../../shared/value-objects/money.vo';

export interface ServiceProps {
  id: string;
  partnerId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: Money;
  durationMinutes: number;
  bookingType: BookingType;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Service extends AggregateRoot {
  private readonly _id: string;
  private readonly _partnerId: string;
  private _categoryId: string;
  private _name: string;
  private _description?: string;
  private _price: Money;
  private _durationMinutes: number;
  private _bookingType: BookingType;
  private _isActive: boolean;
  private _sortOrder: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ServiceProps) {
    super();
    this._id = props.id;
    this._partnerId = props.partnerId;
    this._categoryId = props.categoryId;
    this._name = props.name;
    this._description = props.description;
    this._price = props.price;
    this._durationMinutes = props.durationMinutes;
    this._bookingType = props.bookingType;
    this._isActive = props.isActive;
    this._sortOrder = props.sortOrder;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get partnerId(): string {
    return this._partnerId;
  }

  get categoryId(): string {
    return this._categoryId;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get price(): Money {
    return this._price;
  }

  get durationMinutes(): number {
    return this._durationMinutes;
  }

  get bookingType(): BookingType {
    return this._bookingType;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get sortOrder(): number {
    return this._sortOrder;
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
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    durationMinutes: number;
    bookingType: BookingTypeEnum;
    sortOrder?: number;
  }): Service {
    const now = new Date();
    return new Service({
      id: props.id,
      partnerId: props.partnerId,
      categoryId: props.categoryId,
      name: props.name,
      description: props.description,
      price: Money.create(props.price, props.currency ?? 'VND'),
      durationMinutes: props.durationMinutes,
      bookingType: BookingType.fromString(props.bookingType),
      isActive: true,
      sortOrder: props.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(props: {
    name?: string;
    description?: string;
    categoryId?: string;
    sortOrder?: number;
  }): void {
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.description !== undefined) {
      this._description = props.description;
    }
    if (props.categoryId !== undefined) {
      this._categoryId = props.categoryId;
    }
    if (props.sortOrder !== undefined) {
      this._sortOrder = props.sortOrder;
    }
    this._updatedAt = new Date();
  }

  updatePricing(props: {
    price?: number;
    currency?: string;
    durationMinutes?: number;
  }): void {
    if (props.price !== undefined) {
      this._price = Money.create(
        props.price,
        props.currency ?? this._price.currency,
      );
    }
    if (props.durationMinutes !== undefined) {
      this._durationMinutes = props.durationMinutes;
    }
    this._updatedAt = new Date();
  }

  changeBookingType(type: BookingTypeEnum): void {
    this._bookingType = BookingType.fromString(type);
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
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    durationMinutes: number;
    bookingType: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      partnerId: this._partnerId,
      categoryId: this._categoryId,
      name: this._name,
      description: this._description,
      price: this._price.amount,
      currency: this._price.currency,
      durationMinutes: this._durationMinutes,
      bookingType: this._bookingType.toString(),
      isActive: this._isActive,
      sortOrder: this._sortOrder,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
