import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export enum AccountTypeEnum {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

export class AccountType {
  private readonly _value: AccountTypeEnum;

  private constructor(value: AccountTypeEnum) {
    this._value = value;
  }

  public static individual(): AccountType {
    return new AccountType(AccountTypeEnum.INDIVIDUAL);
  }

  public static business(): AccountType {
    return new AccountType(AccountTypeEnum.BUSINESS);
  }

  public static fromString(value: string): AccountType {
    const validValues = Object.values(AccountTypeEnum) as string[];
    if (!validValues.includes(value)) {
      throw new ValidationException(`Invalid account type: ${value}`);
    }
    return new AccountType(value as AccountTypeEnum);
  }

  public isIndividual(): boolean {
    return this._value === AccountTypeEnum.INDIVIDUAL;
  }

  public isBusiness(): boolean {
    return this._value === AccountTypeEnum.BUSINESS;
  }

  get value(): AccountTypeEnum {
    return this._value;
  }

  equals(other: AccountType): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
