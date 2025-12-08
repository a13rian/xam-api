import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { PartnerType, PartnerTypeEnum } from '../value-objects/partner-type.vo';
import {
  PartnerStatus,
  PartnerStatusEnum,
} from '../value-objects/partner-status.vo';
import { PartnerRegisteredEvent } from '../events/partner-registered.event';
import { PartnerApprovedEvent } from '../events/partner-approved.event';
import { PartnerRejectedEvent } from '../events/partner-rejected.event';
import { PartnerSuspendedEvent } from '../events/partner-suspended.event';
import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export interface PartnerProps {
  id?: string;
  userId: string;
  type: PartnerType;
  status: PartnerStatus;
  businessName: string;
  description?: string | null;
  rating?: number;
  reviewCount?: number;
  isHomeServiceEnabled?: boolean;
  homeServiceRadiusKm?: number | null;
  rejectionReason?: string | null;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePartnerProps {
  userId: string;
  type: PartnerTypeEnum;
  businessName: string;
  description?: string;
}

export class Partner extends AggregateRoot {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _type: PartnerType;
  private _status: PartnerStatus;
  private _businessName: string;
  private _description: string | null;
  private _rating: number;
  private _reviewCount: number;
  private _isHomeServiceEnabled: boolean;
  private _homeServiceRadiusKm: number | null;
  private _rejectionReason: string | null;
  private _approvedAt: Date | null;
  private _approvedBy: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: PartnerProps) {
    super();
    this._id = props.id || uuidv4();
    this._userId = props.userId;
    this._type = props.type;
    this._status = props.status;
    this._businessName = props.businessName;
    this._description = props.description ?? null;
    this._rating = props.rating ?? 0;
    this._reviewCount = props.reviewCount ?? 0;
    this._isHomeServiceEnabled = props.isHomeServiceEnabled ?? false;
    this._homeServiceRadiusKm = props.homeServiceRadiusKm ?? null;
    this._rejectionReason = props.rejectionReason ?? null;
    this._approvedAt = props.approvedAt ?? null;
    this._approvedBy = props.approvedBy ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: CreatePartnerProps): Partner {
    const type = PartnerType.fromString(props.type);

    const partner = new Partner({
      userId: props.userId,
      type,
      status: PartnerStatus.pending(),
      businessName: props.businessName,
      description: props.description,
    });

    partner.apply(
      new PartnerRegisteredEvent(
        partner.id,
        partner.userId,
        partner.type.value,
        partner.businessName,
      ),
    );

    return partner;
  }

  public static reconstitute(props: PartnerProps): Partner {
    return new Partner(props);
  }

  public approve(approvedBy: string): void {
    if (!this._status.canBeApproved()) {
      throw new ValidationException(
        'Partner cannot be approved in current status',
      );
    }

    this._status = PartnerStatus.active();
    this._approvedAt = new Date();
    this._approvedBy = approvedBy;
    this._rejectionReason = null;
    this._updatedAt = new Date();

    this.apply(new PartnerApprovedEvent(this._id, this._userId, approvedBy));
  }

  public reject(rejectedBy: string, reason: string): void {
    if (!this._status.canBeApproved()) {
      throw new ValidationException(
        'Partner cannot be rejected in current status',
      );
    }

    this._status = PartnerStatus.rejected();
    this._rejectionReason = reason;
    this._updatedAt = new Date();

    this.apply(
      new PartnerRejectedEvent(this._id, this._userId, rejectedBy, reason),
    );
  }

  public suspend(reason: string): void {
    if (!this._status.canBeSuspended()) {
      throw new ValidationException(
        'Partner cannot be suspended in current status',
      );
    }

    this._status = PartnerStatus.suspended();
    this._updatedAt = new Date();

    this.apply(new PartnerSuspendedEvent(this._id, this._userId, reason));
  }

  public reactivate(): void {
    if (!this._status.canBeReactivated()) {
      throw new ValidationException(
        'Partner cannot be reactivated in current status',
      );
    }

    this._status = PartnerStatus.active();
    this._updatedAt = new Date();
  }

  public updateProfile(props: {
    businessName?: string;
    description?: string;
  }): void {
    if (props.businessName !== undefined) {
      this._businessName = props.businessName;
    }
    if (props.description !== undefined) {
      this._description = props.description;
    }
    this._updatedAt = new Date();
  }

  public enableHomeService(radiusKm: number): void {
    if (radiusKm <= 0) {
      throw new ValidationException(
        'Home service radius must be greater than 0',
      );
    }
    this._isHomeServiceEnabled = true;
    this._homeServiceRadiusKm = radiusKm;
    this._updatedAt = new Date();
  }

  public disableHomeService(): void {
    this._isHomeServiceEnabled = false;
    this._homeServiceRadiusKm = null;
    this._updatedAt = new Date();
  }

  public updateRating(newRating: number, newReviewCount: number): void {
    this._rating = newRating;
    this._reviewCount = newReviewCount;
    this._updatedAt = new Date();
  }

  public canAddStaff(): boolean {
    return this._type.isOrganization() && this._status.canOperate();
  }

  public canAcceptBookings(): boolean {
    return this._status.canOperate();
  }

  public isWithinHomeServiceRadius(distanceKm: number): boolean {
    if (!this._isHomeServiceEnabled || !this._homeServiceRadiusKm) {
      return false;
    }
    return distanceKm <= this._homeServiceRadiusKm;
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get type(): PartnerType {
    return this._type;
  }

  get typeValue(): PartnerTypeEnum {
    return this._type.value;
  }

  get status(): PartnerStatus {
    return this._status;
  }

  get statusValue(): PartnerStatusEnum {
    return this._status.value;
  }

  get businessName(): string {
    return this._businessName;
  }

  get description(): string | null {
    return this._description;
  }

  get rating(): number {
    return this._rating;
  }

  get reviewCount(): number {
    return this._reviewCount;
  }

  get isHomeServiceEnabled(): boolean {
    return this._isHomeServiceEnabled;
  }

  get homeServiceRadiusKm(): number | null {
    return this._homeServiceRadiusKm;
  }

  get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  get approvedAt(): Date | null {
    return this._approvedAt;
  }

  get approvedBy(): string | null {
    return this._approvedBy;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
