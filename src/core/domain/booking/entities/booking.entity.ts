import { AggregateRoot } from '@nestjs/cqrs';
import {
  BookingStatus,
  BookingStatusEnum,
} from '../value-objects/booking-status.vo';
import { BookingService } from './booking-service.entity';
import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export interface BookingProps {
  id: string;
  customerId: string;
  partnerId: string;
  locationId: string;
  staffId?: string;
  status: BookingStatus;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  isHomeService: boolean;
  customerAddress?: string;
  customerPhone: string;
  customerName: string;
  notes?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  confirmedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  services: BookingService[];
}

export class Booking extends AggregateRoot {
  private readonly _id: string;
  private readonly _customerId: string;
  private readonly _partnerId: string;
  private readonly _locationId: string;
  private readonly _staffId?: string;
  private _status: BookingStatus;
  private readonly _scheduledDate: Date;
  private readonly _startTime: string;
  private readonly _endTime: string;
  private readonly _totalAmount: number;
  private _paidAmount: number;
  private readonly _currency: string;
  private readonly _isHomeService: boolean;
  private readonly _customerAddress?: string;
  private readonly _customerPhone: string;
  private readonly _customerName: string;
  private _notes?: string;
  private _cancellationReason?: string;
  private _cancelledBy?: string;
  private _confirmedAt?: Date;
  private _startedAt?: Date;
  private _completedAt?: Date;
  private _cancelledAt?: Date;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private readonly _services: BookingService[];

  constructor(props: BookingProps) {
    super();
    this._id = props.id;
    this._customerId = props.customerId;
    this._partnerId = props.partnerId;
    this._locationId = props.locationId;
    this._staffId = props.staffId;
    this._status = props.status;
    this._scheduledDate = props.scheduledDate;
    this._startTime = props.startTime;
    this._endTime = props.endTime;
    this._totalAmount = props.totalAmount;
    this._paidAmount = props.paidAmount;
    this._currency = props.currency;
    this._isHomeService = props.isHomeService;
    this._customerAddress = props.customerAddress;
    this._customerPhone = props.customerPhone;
    this._customerName = props.customerName;
    this._notes = props.notes;
    this._cancellationReason = props.cancellationReason;
    this._cancelledBy = props.cancelledBy;
    this._confirmedAt = props.confirmedAt;
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    this._cancelledAt = props.cancelledAt;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._services = props.services;
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get customerId(): string {
    return this._customerId;
  }
  get partnerId(): string {
    return this._partnerId;
  }
  get locationId(): string {
    return this._locationId;
  }
  get staffId(): string | undefined {
    return this._staffId;
  }
  get status(): BookingStatus {
    return this._status;
  }
  get scheduledDate(): Date {
    return this._scheduledDate;
  }
  get startTime(): string {
    return this._startTime;
  }
  get endTime(): string {
    return this._endTime;
  }
  get totalAmount(): number {
    return this._totalAmount;
  }
  get paidAmount(): number {
    return this._paidAmount;
  }
  get currency(): string {
    return this._currency;
  }
  get isHomeService(): boolean {
    return this._isHomeService;
  }
  get customerAddress(): string | undefined {
    return this._customerAddress;
  }
  get customerPhone(): string {
    return this._customerPhone;
  }
  get customerName(): string {
    return this._customerName;
  }
  get notes(): string | undefined {
    return this._notes;
  }
  get cancellationReason(): string | undefined {
    return this._cancellationReason;
  }
  get cancelledBy(): string | undefined {
    return this._cancelledBy;
  }
  get confirmedAt(): Date | undefined {
    return this._confirmedAt;
  }
  get startedAt(): Date | undefined {
    return this._startedAt;
  }
  get completedAt(): Date | undefined {
    return this._completedAt;
  }
  get cancelledAt(): Date | undefined {
    return this._cancelledAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get services(): BookingService[] {
    return this._services;
  }

  static create(props: {
    id: string;
    customerId: string;
    partnerId: string;
    locationId: string;
    staffId?: string;
    scheduledDate: Date;
    startTime: string;
    endTime: string;
    totalAmount: number;
    currency: string;
    isHomeService: boolean;
    customerAddress?: string;
    customerPhone: string;
    customerName: string;
    notes?: string;
    services: BookingService[];
  }): Booking {
    const now = new Date();
    return new Booking({
      ...props,
      status: BookingStatus.pending(),
      paidAmount: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  confirm(): void {
    if (!this._status.canBeConfirmed()) {
      throw new ValidationException(
        'Booking cannot be confirmed in current status',
      );
    }
    this._status = BookingStatus.confirmed();
    this._confirmedAt = new Date();
    this._updatedAt = new Date();
  }

  markPaymentReceived(amount: number): void {
    this._paidAmount = amount;
    this._updatedAt = new Date();
  }

  start(): void {
    if (!this._status.canBeStarted()) {
      throw new ValidationException(
        'Booking cannot be started in current status',
      );
    }
    this._status = BookingStatus.inProgress();
    this._startedAt = new Date();
    this._updatedAt = new Date();
  }

  complete(): void {
    if (!this._status.canBeCompleted()) {
      throw new ValidationException(
        'Booking cannot be completed in current status',
      );
    }
    this._status = BookingStatus.completed();
    this._completedAt = new Date();
    this._updatedAt = new Date();
  }

  cancel(cancelledBy: string, reason: string): void {
    if (!this._status.canBeCancelled()) {
      throw new ValidationException(
        'Booking cannot be cancelled in current status',
      );
    }
    this._status = BookingStatus.cancelled();
    this._cancelledBy = cancelledBy;
    this._cancellationReason = reason;
    this._cancelledAt = new Date();
    this._updatedAt = new Date();
  }

  canBeRescheduled(): boolean {
    return this._status.isPending() || this._status.isConfirmed();
  }

  reschedule(newDate: Date, newStartTime: string, newEndTime: string): void {
    if (!this.canBeRescheduled()) {
      throw new ValidationException(
        'Booking cannot be rescheduled in current status',
      );
    }
    (this as any)._scheduledDate = newDate;
    (this as any)._startTime = newStartTime;
    (this as any)._endTime = newEndTime;
    this._updatedAt = new Date();
  }

  calculateRefundAmount(): number {
    if (!this._status.isCancelled()) {
      return 0;
    }

    // If not paid yet, no refund
    if (this._paidAmount === 0) {
      return 0;
    }

    const now = new Date();
    const scheduledDateTime = new Date(this._scheduledDate);
    const [hours, minutes] = this._startTime.split(':').map(Number);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    const hoursUntilBooking =
      (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Refund policy:
    // - Cancel 24h+ before: 100% refund
    // - Cancel 2-24h before: 50% refund
    // - Cancel <2h before: 0% refund
    if (hoursUntilBooking >= 24) {
      return this._paidAmount;
    } else if (hoursUntilBooking >= 2) {
      return Math.round(this._paidAmount * 0.5);
    }
    return 0;
  }

  toObject(): {
    id: string;
    customerId: string;
    partnerId: string;
    locationId: string;
    staffId?: string;
    status: string;
    scheduledDate: Date;
    startTime: string;
    endTime: string;
    totalAmount: number;
    paidAmount: number;
    currency: string;
    isHomeService: boolean;
    customerAddress?: string;
    customerPhone: string;
    customerName: string;
    notes?: string;
    cancellationReason?: string;
    cancelledBy?: string;
    confirmedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    services: ReturnType<BookingService['toObject']>[];
  } {
    return {
      id: this._id,
      customerId: this._customerId,
      partnerId: this._partnerId,
      locationId: this._locationId,
      staffId: this._staffId,
      status: this._status.value,
      scheduledDate: this._scheduledDate,
      startTime: this._startTime,
      endTime: this._endTime,
      totalAmount: this._totalAmount,
      paidAmount: this._paidAmount,
      currency: this._currency,
      isHomeService: this._isHomeService,
      customerAddress: this._customerAddress,
      customerPhone: this._customerPhone,
      customerName: this._customerName,
      notes: this._notes,
      cancellationReason: this._cancellationReason,
      cancelledBy: this._cancelledBy,
      confirmedAt: this._confirmedAt,
      startedAt: this._startedAt,
      completedAt: this._completedAt,
      cancelledAt: this._cancelledAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      services: this._services.map((s) => s.toObject()),
    };
  }
}
