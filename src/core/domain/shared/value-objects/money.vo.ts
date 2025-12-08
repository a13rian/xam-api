import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  private constructor(amount: number, currency: string) {
    this._amount = amount;
    this._currency = currency;
  }

  public static create(amount: number, currency: string = 'VND'): Money {
    if (amount < 0) {
      throw new ValidationException('Amount cannot be negative');
    }
    if (!currency || currency.length !== 3) {
      throw new ValidationException('Currency must be a 3-letter code');
    }
    return new Money(Math.round(amount * 100) / 100, currency.toUpperCase());
  }

  public static zero(currency: string = 'VND'): Money {
    return new Money(0, currency.toUpperCase());
  }

  public static vnd(amount: number): Money {
    return Money.create(amount, 'VND');
  }

  public add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  public subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this._amount - other._amount;
    if (result < 0) {
      throw new ValidationException('Insufficient amount');
    }
    return new Money(result, this._currency);
  }

  public multiply(factor: number): Money {
    if (factor < 0) {
      throw new ValidationException('Factor cannot be negative');
    }
    return new Money(
      Math.round(this._amount * factor * 100) / 100,
      this._currency,
    );
  }

  public isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amount > other._amount;
  }

  public isGreaterThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amount >= other._amount;
  }

  public isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amount < other._amount;
  }

  public isLessThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amount <= other._amount;
  }

  public isZero(): boolean {
    return this._amount === 0;
  }

  public equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  private assertSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new ValidationException(
        `Currency mismatch: ${this._currency} vs ${other._currency}`,
      );
    }
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  toString(): string {
    return `${this._amount} ${this._currency}`;
  }
}
