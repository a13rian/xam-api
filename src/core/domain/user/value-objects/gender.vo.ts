import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export class Gender {
  private readonly _value: GenderEnum;

  private constructor(value: GenderEnum) {
    this._value = value;
  }

  public static male(): Gender {
    return new Gender(GenderEnum.MALE);
  }

  public static female(): Gender {
    return new Gender(GenderEnum.FEMALE);
  }

  public static other(): Gender {
    return new Gender(GenderEnum.OTHER);
  }

  public static preferNotToSay(): Gender {
    return new Gender(GenderEnum.PREFER_NOT_TO_SAY);
  }

  public static fromString(value: string): Gender {
    const validValues = Object.values(GenderEnum) as string[];
    if (!validValues.includes(value)) {
      throw new ValidationException(`Invalid gender: ${value}`);
    }
    return new Gender(value as GenderEnum);
  }

  get value(): GenderEnum {
    return this._value;
  }

  equals(other: Gender): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
