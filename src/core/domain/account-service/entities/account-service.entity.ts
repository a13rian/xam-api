import { AggregateRoot } from '@nestjs/cqrs';
import { createId } from '@paralleldrive/cuid2';
import { Money } from '../../shared/value-objects/money.vo';
import { ValidationException } from '../../../../shared/exceptions/domain.exception';

const ACCOUNT_SERVICE_ID_PREFIX = 'asv';

export interface AccountServiceProps {
  id: string;
  accountId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: Money;
  durationMinutes: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class AccountService extends AggregateRoot {
  private readonly _id: string;
  private readonly _accountId: string;
  private _categoryId: string;
  private _name: string;
  private _description?: string;
  private _price: Money;
  private _durationMinutes: number;
  private _isActive: boolean;
  private _sortOrder: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: AccountServiceProps) {
    super();
    this._id = props.id;
    this._accountId = props.accountId;
    this._categoryId = props.categoryId;
    this._name = props.name;
    this._description = props.description;
    this._price = props.price;
    this._durationMinutes = props.durationMinutes;
    this._isActive = props.isActive;
    this._sortOrder = props.sortOrder;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get accountId(): string {
    return this._accountId;
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
    accountId: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    durationMinutes: number;
    sortOrder?: number;
  }): AccountService {
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationException('Service name is required');
    }
    if (props.durationMinutes < 1) {
      throw new ValidationException('Duration must be at least 1 minute');
    }

    const now = new Date();
    return new AccountService({
      id: `${ACCOUNT_SERVICE_ID_PREFIX}_${createId()}`,
      accountId: props.accountId,
      categoryId: props.categoryId,
      name: props.name.trim(),
      description: props.description?.trim(),
      price: Money.create(props.price, props.currency ?? 'VND'),
      durationMinutes: props.durationMinutes,
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
      if (!props.name || props.name.trim().length === 0) {
        throw new ValidationException('Service name cannot be empty');
      }
      this._name = props.name.trim();
    }
    if (props.description !== undefined) {
      this._description = props.description?.trim();
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
      if (props.durationMinutes < 1) {
        throw new ValidationException('Duration must be at least 1 minute');
      }
      this._durationMinutes = props.durationMinutes;
    }
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
    accountId: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    durationMinutes: number;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      accountId: this._accountId,
      categoryId: this._categoryId,
      name: this._name,
      description: this._description,
      price: this._price.amount,
      currency: this._price.currency,
      durationMinutes: this._durationMinutes,
      isActive: this._isActive,
      sortOrder: this._sortOrder,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
