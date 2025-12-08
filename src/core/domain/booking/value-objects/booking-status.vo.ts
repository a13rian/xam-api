export enum BookingStatusEnum {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class BookingStatus {
  private readonly _value: BookingStatusEnum;

  private constructor(value: BookingStatusEnum) {
    this._value = value;
  }

  get value(): BookingStatusEnum {
    return this._value;
  }

  static pending(): BookingStatus {
    return new BookingStatus(BookingStatusEnum.PENDING);
  }

  static confirmed(): BookingStatus {
    return new BookingStatus(BookingStatusEnum.CONFIRMED);
  }

  static inProgress(): BookingStatus {
    return new BookingStatus(BookingStatusEnum.IN_PROGRESS);
  }

  static completed(): BookingStatus {
    return new BookingStatus(BookingStatusEnum.COMPLETED);
  }

  static cancelled(): BookingStatus {
    return new BookingStatus(BookingStatusEnum.CANCELLED);
  }

  static fromString(value: string): BookingStatus {
    const enumValue = value as BookingStatusEnum;
    if (!Object.values(BookingStatusEnum).includes(enumValue)) {
      throw new Error(`Invalid booking status: ${value}`);
    }
    return new BookingStatus(enumValue);
  }

  isPending(): boolean {
    return this._value === BookingStatusEnum.PENDING;
  }

  isConfirmed(): boolean {
    return this._value === BookingStatusEnum.CONFIRMED;
  }

  isInProgress(): boolean {
    return this._value === BookingStatusEnum.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this._value === BookingStatusEnum.COMPLETED;
  }

  isCancelled(): boolean {
    return this._value === BookingStatusEnum.CANCELLED;
  }

  canBeConfirmed(): boolean {
    return this._value === BookingStatusEnum.PENDING;
  }

  canBeStarted(): boolean {
    return this._value === BookingStatusEnum.CONFIRMED;
  }

  canBeCompleted(): boolean {
    return this._value === BookingStatusEnum.IN_PROGRESS;
  }

  canBeCancelled(): boolean {
    return (
      this._value === BookingStatusEnum.PENDING ||
      this._value === BookingStatusEnum.CONFIRMED
    );
  }

  equals(other: BookingStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
