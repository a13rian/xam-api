import { AggregateRoot } from '@nestjs/cqrs';

export enum DayOfWeek {
  MONDAY = 0,
  TUESDAY = 1,
  WEDNESDAY = 2,
  THURSDAY = 3,
  FRIDAY = 4,
  SATURDAY = 5,
  SUNDAY = 6,
}

export interface OperatingHoursProps {
  id: string;
  locationId: string;
  dayOfWeek: DayOfWeek;
  openTime: string; // Format: "HH:mm"
  closeTime: string; // Format: "HH:mm"
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class OperatingHours extends AggregateRoot {
  private readonly _id: string;
  private readonly _locationId: string;
  private _dayOfWeek: DayOfWeek;
  private _openTime: string;
  private _closeTime: string;
  private _isClosed: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: OperatingHoursProps) {
    super();
    this._id = props.id;
    this._locationId = props.locationId;
    this._dayOfWeek = props.dayOfWeek;
    this._openTime = props.openTime;
    this._closeTime = props.closeTime;
    this._isClosed = props.isClosed;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get locationId(): string {
    return this._locationId;
  }

  get dayOfWeek(): DayOfWeek {
    return this._dayOfWeek;
  }

  get openTime(): string {
    return this._openTime;
  }

  get closeTime(): string {
    return this._closeTime;
  }

  get isClosed(): boolean {
    return this._isClosed;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: {
    id: string;
    locationId: string;
    dayOfWeek: DayOfWeek;
    openTime: string;
    closeTime: string;
    isClosed?: boolean;
  }): OperatingHours {
    const now = new Date();
    return new OperatingHours({
      id: props.id,
      locationId: props.locationId,
      dayOfWeek: props.dayOfWeek,
      openTime: props.openTime,
      closeTime: props.closeTime,
      isClosed: props.isClosed ?? false,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(props: { openTime?: string; closeTime?: string }): void {
    if (props.openTime !== undefined) {
      this._openTime = props.openTime;
    }
    if (props.closeTime !== undefined) {
      this._closeTime = props.closeTime;
    }
    this._updatedAt = new Date();
  }

  markClosed(): void {
    this._isClosed = true;
    this._updatedAt = new Date();
  }

  markOpen(): void {
    this._isClosed = false;
    this._updatedAt = new Date();
  }

  isOpenAt(time: string): boolean {
    if (this._isClosed) return false;
    return time >= this._openTime && time < this._closeTime;
  }

  toObject(): {
    id: string;
    locationId: string;
    dayOfWeek: DayOfWeek;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      locationId: this._locationId,
      dayOfWeek: this._dayOfWeek,
      openTime: this._openTime,
      closeTime: this._closeTime,
      isClosed: this._isClosed,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
