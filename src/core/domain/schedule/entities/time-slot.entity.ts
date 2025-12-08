import { AggregateRoot } from '@nestjs/cqrs';

export enum TimeSlotStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  BLOCKED = 'blocked',
}

export interface TimeSlotProps {
  id: string;
  locationId: string;
  staffId?: string;
  date: Date;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  status: TimeSlotStatus;
  bookingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TimeSlot extends AggregateRoot {
  private readonly _id: string;
  private readonly _locationId: string;
  private readonly _staffId?: string;
  private readonly _date: Date;
  private readonly _startTime: string;
  private readonly _endTime: string;
  private _status: TimeSlotStatus;
  private _bookingId?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: TimeSlotProps) {
    super();
    this._id = props.id;
    this._locationId = props.locationId;
    this._staffId = props.staffId;
    this._date = props.date;
    this._startTime = props.startTime;
    this._endTime = props.endTime;
    this._status = props.status;
    this._bookingId = props.bookingId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get locationId(): string {
    return this._locationId;
  }

  get staffId(): string | undefined {
    return this._staffId;
  }

  get date(): Date {
    return this._date;
  }

  get startTime(): string {
    return this._startTime;
  }

  get endTime(): string {
    return this._endTime;
  }

  get status(): TimeSlotStatus {
    return this._status;
  }

  get bookingId(): string | undefined {
    return this._bookingId;
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
    staffId?: string;
    date: Date;
    startTime: string;
    endTime: string;
  }): TimeSlot {
    const now = new Date();
    return new TimeSlot({
      id: props.id,
      locationId: props.locationId,
      staffId: props.staffId,
      date: props.date,
      startTime: props.startTime,
      endTime: props.endTime,
      status: TimeSlotStatus.AVAILABLE,
      createdAt: now,
      updatedAt: now,
    });
  }

  isAvailable(): boolean {
    return this._status === TimeSlotStatus.AVAILABLE;
  }

  isBooked(): boolean {
    return this._status === TimeSlotStatus.BOOKED;
  }

  isBlocked(): boolean {
    return this._status === TimeSlotStatus.BLOCKED;
  }

  book(bookingId: string): void {
    if (this._status !== TimeSlotStatus.AVAILABLE) {
      throw new Error('Time slot is not available');
    }
    this._status = TimeSlotStatus.BOOKED;
    this._bookingId = bookingId;
    this._updatedAt = new Date();
  }

  release(): void {
    this._status = TimeSlotStatus.AVAILABLE;
    this._bookingId = undefined;
    this._updatedAt = new Date();
  }

  block(): void {
    if (this._status === TimeSlotStatus.BOOKED) {
      throw new Error('Cannot block a booked time slot');
    }
    this._status = TimeSlotStatus.BLOCKED;
    this._updatedAt = new Date();
  }

  unblock(): void {
    if (this._status !== TimeSlotStatus.BLOCKED) {
      throw new Error('Time slot is not blocked');
    }
    this._status = TimeSlotStatus.AVAILABLE;
    this._updatedAt = new Date();
  }

  toObject(): {
    id: string;
    locationId: string;
    staffId?: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: TimeSlotStatus;
    bookingId?: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      locationId: this._locationId,
      staffId: this._staffId,
      date: this._date,
      startTime: this._startTime,
      endTime: this._endTime,
      status: this._status,
      bookingId: this._bookingId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
