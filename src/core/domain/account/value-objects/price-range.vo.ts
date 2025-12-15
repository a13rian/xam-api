import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export interface PriceRangeData {
  min: number;
  max: number;
  currency: string;
}

export class PriceRange {
  private readonly _min: number;
  private readonly _max: number;
  private readonly _currency: string;

  private constructor(min: number, max: number, currency: string) {
    this._min = min;
    this._max = max;
    this._currency = currency;
  }

  public static create(
    min: number,
    max: number,
    currency: string = 'VND',
  ): PriceRange {
    if (min < 0) {
      throw new ValidationException('Minimum price cannot be negative');
    }
    if (max < 0) {
      throw new ValidationException('Maximum price cannot be negative');
    }
    if (min > max) {
      throw new ValidationException(
        'Minimum price cannot be greater than maximum price',
      );
    }
    return new PriceRange(min, max, currency);
  }

  public static fromData(data: PriceRangeData): PriceRange {
    return PriceRange.create(data.min, data.max, data.currency);
  }

  public static fromJSON(json: PriceRangeData | null): PriceRange | null {
    if (!json) return null;
    return PriceRange.fromData(json);
  }

  get min(): number {
    return this._min;
  }

  get max(): number {
    return this._max;
  }

  get currency(): string {
    return this._currency;
  }

  public toJSON(): PriceRangeData {
    return {
      min: this._min,
      max: this._max,
      currency: this._currency,
    };
  }

  public equals(other: PriceRange): boolean {
    return (
      this._min === other._min &&
      this._max === other._max &&
      this._currency === other._currency
    );
  }

  public format(): string {
    const formatter = new Intl.NumberFormat('vi-VN');
    return `${formatter.format(this._min)} - ${formatter.format(this._max)} ${this._currency}`;
  }
}
