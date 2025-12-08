import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export enum PartnerTypeEnum {
  FREELANCE = 'freelance',
  ORGANIZATION = 'organization',
}

export class PartnerType {
  private readonly _value: PartnerTypeEnum;

  private constructor(value: PartnerTypeEnum) {
    this._value = value;
  }

  public static freelance(): PartnerType {
    return new PartnerType(PartnerTypeEnum.FREELANCE);
  }

  public static organization(): PartnerType {
    return new PartnerType(PartnerTypeEnum.ORGANIZATION);
  }

  public static fromString(value: string): PartnerType {
    const enumValue = Object.values(PartnerTypeEnum).find((v) => v === value);
    if (!enumValue) {
      throw new ValidationException(`Invalid partner type: ${value}`);
    }
    return new PartnerType(enumValue);
  }

  public isFreelance(): boolean {
    return this._value === PartnerTypeEnum.FREELANCE;
  }

  public isOrganization(): boolean {
    return this._value === PartnerTypeEnum.ORGANIZATION;
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
