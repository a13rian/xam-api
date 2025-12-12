import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export enum AccountRoleEnum {
  OWNER = 'owner',
  MANAGER = 'manager',
  MEMBER = 'member',
}

export class AccountRole {
  private constructor(private readonly _value: AccountRoleEnum) {}

  static owner(): AccountRole {
    return new AccountRole(AccountRoleEnum.OWNER);
  }

  static manager(): AccountRole {
    return new AccountRole(AccountRoleEnum.MANAGER);
  }

  static member(): AccountRole {
    return new AccountRole(AccountRoleEnum.MEMBER);
  }

  static fromString(value: string): AccountRole {
    const enumValue = Object.values(AccountRoleEnum).find((v) => v === value);
    if (!enumValue) {
      throw new ValidationException(`Invalid account role: ${value}`);
    }
    return new AccountRole(enumValue);
  }

  get value(): AccountRoleEnum {
    return this._value;
  }

  isOwner(): boolean {
    return this._value === AccountRoleEnum.OWNER;
  }

  isManager(): boolean {
    return this._value === AccountRoleEnum.MANAGER;
  }

  isMember(): boolean {
    return this._value === AccountRoleEnum.MEMBER;
  }

  canManageMembers(): boolean {
    return (
      this._value === AccountRoleEnum.OWNER ||
      this._value === AccountRoleEnum.MANAGER
    );
  }

  canManageServices(): boolean {
    return (
      this._value === AccountRoleEnum.OWNER ||
      this._value === AccountRoleEnum.MANAGER
    );
  }

  canManageBookings(): boolean {
    return true;
  }

  canManageOrganization(): boolean {
    return this._value === AccountRoleEnum.OWNER;
  }

  equals(other: AccountRole): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
