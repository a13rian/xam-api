import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import {
  OrganizationStatus,
  OrganizationStatusEnum,
} from '../value-objects/organization-status.vo';
import { ValidationException } from '../../../../shared/exceptions/domain.exception';
import { OrganizationCreatedEvent } from '../events/organization-created.event';
import { OrganizationApprovedEvent } from '../events/organization-approved.event';
import { OrganizationRejectedEvent } from '../events/organization-rejected.event';
import { OrganizationSuspendedEvent } from '../events/organization-suspended.event';

export interface OrganizationProps {
  id?: string;
  status: OrganizationStatus;
  description?: string | null;
  rating?: number;
  reviewCount?: number;
  isHomeServiceEnabled?: boolean;
  homeServiceRadiusKm?: number | null;
  rejectionReason?: string | null;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  // Business fields (merged from PartnerBusiness)
  businessName: string;
  taxId?: string | null;
  businessLicense?: string | null;
  companySize?: string | null;
  website?: string | null;
  socialMedia?: Record<string, string>;
  establishedDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateOrganizationProps {
  businessName: string;
  description?: string;
  taxId?: string;
  businessLicense?: string;
  companySize?: string;
  website?: string;
  socialMedia?: Record<string, string>;
  establishedDate?: Date;
}

export class Organization extends AggregateRoot {
  private readonly _id: string;
  private _status: OrganizationStatus;
  private _description: string | null;
  private _rating: number;
  private _reviewCount: number;
  private _isHomeServiceEnabled: boolean;
  private _homeServiceRadiusKm: number | null;
  private _rejectionReason: string | null;
  private _approvedAt: Date | null;
  private _approvedBy: string | null;
  // Business fields
  private _businessName: string;
  private _taxId: string | null;
  private _businessLicense: string | null;
  private _companySize: string | null;
  private _website: string | null;
  private _socialMedia: Record<string, string>;
  private _establishedDate: Date | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: OrganizationProps) {
    super();
    this._id = props.id || uuidv4();
    this._status = props.status;
    this._description = props.description ?? null;
    this._rating = props.rating ?? 0;
    this._reviewCount = props.reviewCount ?? 0;
    this._isHomeServiceEnabled = props.isHomeServiceEnabled ?? false;
    this._homeServiceRadiusKm = props.homeServiceRadiusKm ?? null;
    this._rejectionReason = props.rejectionReason ?? null;
    this._approvedAt = props.approvedAt ?? null;
    this._approvedBy = props.approvedBy ?? null;
    this._businessName = props.businessName;
    this._taxId = props.taxId ?? null;
    this._businessLicense = props.businessLicense ?? null;
    this._companySize = props.companySize ?? null;
    this._website = props.website ?? null;
    this._socialMedia = props.socialMedia ?? {};
    this._establishedDate = props.establishedDate ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: CreateOrganizationProps): Organization {
    const organization = new Organization({
      status: OrganizationStatus.pending(),
      businessName: props.businessName,
      description: props.description,
      taxId: props.taxId,
      businessLicense: props.businessLicense,
      companySize: props.companySize,
      website: props.website,
      socialMedia: props.socialMedia,
      establishedDate: props.establishedDate,
    });

    organization.apply(
      new OrganizationCreatedEvent(organization.id, organization.businessName),
    );

    return organization;
  }

  public static reconstitute(props: OrganizationProps): Organization {
    return new Organization(props);
  }

  public approve(approvedBy: string): void {
    if (!this._status.canBeApproved()) {
      throw new ValidationException(
        'Organization cannot be approved in current status',
      );
    }

    this._status = OrganizationStatus.active();
    this._approvedAt = new Date();
    this._approvedBy = approvedBy;
    this._rejectionReason = null;
    this._updatedAt = new Date();

    this.apply(new OrganizationApprovedEvent(this._id, approvedBy));
  }

  public reject(rejectedBy: string, reason: string): void {
    if (!this._status.canBeApproved()) {
      throw new ValidationException(
        'Organization cannot be rejected in current status',
      );
    }

    this._status = OrganizationStatus.rejected();
    this._rejectionReason = reason;
    this._updatedAt = new Date();

    this.apply(new OrganizationRejectedEvent(this._id, rejectedBy, reason));
  }

  public suspend(reason: string): void {
    if (!this._status.canBeSuspended()) {
      throw new ValidationException(
        'Organization cannot be suspended in current status',
      );
    }

    this._status = OrganizationStatus.suspended();
    this._updatedAt = new Date();

    this.apply(new OrganizationSuspendedEvent(this._id, reason));
  }

  public reactivate(): void {
    if (!this._status.canBeReactivated()) {
      throw new ValidationException(
        'Organization cannot be reactivated in current status',
      );
    }

    this._status = OrganizationStatus.active();
    this._updatedAt = new Date();
  }

  public update(props: {
    businessName?: string;
    description?: string;
    taxId?: string | null;
    businessLicense?: string | null;
    companySize?: string | null;
    website?: string | null;
    socialMedia?: Record<string, string>;
    establishedDate?: Date | null;
  }): void {
    if (props.businessName !== undefined) {
      this._businessName = props.businessName;
    }
    if (props.description !== undefined) {
      this._description = props.description;
    }
    if (props.taxId !== undefined) {
      this._taxId = props.taxId;
    }
    if (props.businessLicense !== undefined) {
      this._businessLicense = props.businessLicense;
    }
    if (props.companySize !== undefined) {
      this._companySize = props.companySize;
    }
    if (props.website !== undefined) {
      this._website = props.website;
    }
    if (props.socialMedia !== undefined) {
      this._socialMedia = props.socialMedia;
    }
    if (props.establishedDate !== undefined) {
      this._establishedDate = props.establishedDate;
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

  get status(): OrganizationStatus {
    return this._status;
  }

  get statusValue(): OrganizationStatusEnum {
    return this._status.value;
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

  get businessName(): string {
    return this._businessName;
  }

  get taxId(): string | null {
    return this._taxId;
  }

  get businessLicense(): string | null {
    return this._businessLicense;
  }

  get companySize(): string | null {
    return this._companySize;
  }

  get website(): string | null {
    return this._website;
  }

  get socialMedia(): Record<string, string> {
    return { ...this._socialMedia };
  }

  get establishedDate(): Date | null {
    return this._establishedDate;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
