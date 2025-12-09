import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export enum PartnerTypeEnum {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

export class PartnerType {
  private readonly _value: PartnerTypeEnum;

  private constructor(value: PartnerTypeEnum) {
    this._value = value;
  }

  public static individual(): PartnerType {
    return new PartnerType(PartnerTypeEnum.INDIVIDUAL);
  }

  public static business(): PartnerType {
    return new PartnerType(PartnerTypeEnum.BUSINESS);
  }

  public static fromString(value: string): PartnerType {
    const validValues = Object.values(PartnerTypeEnum) as string[];
    if (!validValues.includes(value)) {
      throw new ValidationException(`Invalid partner type: ${value}`);
    }
    return new PartnerType(value as PartnerTypeEnum);
  }

  public isIndividual(): boolean {
    return this._value === PartnerTypeEnum.INDIVIDUAL;
  }

  public isBusiness(): boolean {
    return this._value === PartnerTypeEnum.BUSINESS;
  }

  get value(): PartnerTypeEnum {
    return this._value;
  }

  equals(other: PartnerType): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
