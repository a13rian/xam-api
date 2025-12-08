export enum BookingTypeEnum {
  TIME_SLOT = 'time_slot',
  CALENDAR = 'calendar',
  WALK_IN = 'walk_in',
}

export class BookingType {
  private readonly _value: BookingTypeEnum;

  private constructor(value: BookingTypeEnum) {
    this._value = value;
  }

  get value(): BookingTypeEnum {
    return this._value;
  }

  static timeSlot(): BookingType {
    return new BookingType(BookingTypeEnum.TIME_SLOT);
  }

  static calendar(): BookingType {
    return new BookingType(BookingTypeEnum.CALENDAR);
  }

  static fromString(value: string): BookingType {
    const enumValue = value as BookingTypeEnum;
    if (!Object.values(BookingTypeEnum).includes(enumValue)) {
      throw new Error(`Invalid booking type: ${value}`);
    }
    return new BookingType(enumValue);
  }

  isTimeSlot(): boolean {
    return this._value === BookingTypeEnum.TIME_SLOT;
  }

  isCalendar(): boolean {
    return this._value === BookingTypeEnum.CALENDAR;
  }

  equals(other: BookingType): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
