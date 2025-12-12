import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export enum OrganizationStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export class OrganizationStatus {
  private readonly _value: OrganizationStatusEnum;

  private constructor(value: OrganizationStatusEnum) {
    this._value = value;
  }

  public static pending(): OrganizationStatus {
    return new OrganizationStatus(OrganizationStatusEnum.PENDING);
  }

  public static active(): OrganizationStatus {
    return new OrganizationStatus(OrganizationStatusEnum.ACTIVE);
  }

  public static suspended(): OrganizationStatus {
    return new OrganizationStatus(OrganizationStatusEnum.SUSPENDED);
  }

  public static rejected(): OrganizationStatus {
    return new OrganizationStatus(OrganizationStatusEnum.REJECTED);
  }

  public static fromString(value: string): OrganizationStatus {
    const enumValue = Object.values(OrganizationStatusEnum).find(
      (v) => v === value,
    );
    if (!enumValue) {
      throw new ValidationException(`Invalid organization status: ${value}`);
    }
    return new OrganizationStatus(enumValue);
  }

  public isPending(): boolean {
    return this._value === OrganizationStatusEnum.PENDING;
  }

  public isActive(): boolean {
    return this._value === OrganizationStatusEnum.ACTIVE;
  }

  public isSuspended(): boolean {
    return this._value === OrganizationStatusEnum.SUSPENDED;
  }

  public isRejected(): boolean {
    return this._value === OrganizationStatusEnum.REJECTED;
  }

  public canOperate(): boolean {
    return this._value === OrganizationStatusEnum.ACTIVE;
  }

  public canBeApproved(): boolean {
    return this._value === OrganizationStatusEnum.PENDING;
  }

  public canBeSuspended(): boolean {
    return this._value === OrganizationStatusEnum.ACTIVE;
  }

  public canBeReactivated(): boolean {
    return this._value === OrganizationStatusEnum.SUSPENDED;
  }

  get value(): OrganizationStatusEnum {
    return this._value;
  }

  equals(other: OrganizationStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
