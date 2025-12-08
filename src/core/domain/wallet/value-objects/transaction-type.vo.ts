export enum TransactionTypeEnum {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  PAYMENT = 'payment',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
}

export class TransactionType {
  private readonly _value: TransactionTypeEnum;

  private constructor(value: TransactionTypeEnum) {
    this._value = value;
  }

  public static deposit(): TransactionType {
    return new TransactionType(TransactionTypeEnum.DEPOSIT);
  }

  public static withdrawal(): TransactionType {
    return new TransactionType(TransactionTypeEnum.WITHDRAWAL);
  }

  public static payment(): TransactionType {
    return new TransactionType(TransactionTypeEnum.PAYMENT);
  }

  public static refund(): TransactionType {
    return new TransactionType(TransactionTypeEnum.REFUND);
  }

  public static adjustment(): TransactionType {
    return new TransactionType(TransactionTypeEnum.ADJUSTMENT);
  }

  public static fromString(value: string): TransactionType {
    const enumValue = Object.values(TransactionTypeEnum).find(
      (v) => v === value,
    );
    if (!enumValue) {
      throw new Error(`Invalid transaction type: ${value}`);
    }
    return new TransactionType(enumValue);
  }

  public isCredit(): boolean {
    return (
      this._value === TransactionTypeEnum.DEPOSIT ||
      this._value === TransactionTypeEnum.REFUND
    );
  }

  public isDebit(): boolean {
    return (
      this._value === TransactionTypeEnum.WITHDRAWAL ||
      this._value === TransactionTypeEnum.PAYMENT
    );
  }

  get value(): TransactionTypeEnum {
    return this._value;
  }

  equals(other: TransactionType): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
