import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): Email {
    if (!Email.isValid(value)) {
      throw new ValidationException(`Invalid email format: ${value}`);
    }
    return new Email(value.toLowerCase().trim());
  }

  public static isValid(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
