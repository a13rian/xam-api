import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export enum AccountStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export class AccountStatus {
  private readonly _value: AccountStatusEnum;

  private constructor(value: AccountStatusEnum) {
    this._value = value;
  }

  public static pending(): AccountStatus {
    return new AccountStatus(AccountStatusEnum.PENDING);
  }

  public static active(): AccountStatus {
    return new AccountStatus(AccountStatusEnum.ACTIVE);
  }

  public static suspended(): AccountStatus {
    return new AccountStatus(AccountStatusEnum.SUSPENDED);
  }

  public static rejected(): AccountStatus {
    return new AccountStatus(AccountStatusEnum.REJECTED);
  }

  public static fromString(value: string): AccountStatus {
    const enumValue = Object.values(AccountStatusEnum).find((v) => v === value);
    if (!enumValue) {
      throw new ValidationException(`Invalid account status: ${value}`);
    }
    return new AccountStatus(enumValue);
  }

  public isPending(): boolean {
    return this._value === AccountStatusEnum.PENDING;
  }

  public isActive(): boolean {
    return this._value === AccountStatusEnum.ACTIVE;
  }

  public isSuspended(): boolean {
    return this._value === AccountStatusEnum.SUSPENDED;
  }

  public isRejected(): boolean {
    return this._value === AccountStatusEnum.REJECTED;
  }

  public canOperate(): boolean {
    return this._value === AccountStatusEnum.ACTIVE;
  }

  public canBeApproved(): boolean {
    return this._value === AccountStatusEnum.PENDING;
  }

  public canBeSuspended(): boolean {
    return this._value === AccountStatusEnum.ACTIVE;
  }

  public canBeReactivated(): boolean {
    return this._value === AccountStatusEnum.SUSPENDED;
  }

  get value(): AccountStatusEnum {
    return this._value;
  }

  equals(other: AccountStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
