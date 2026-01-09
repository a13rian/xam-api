import { AggregateRoot } from '@nestjs/cqrs';
import { createId } from '@paralleldrive/cuid2';
import { AccountType, AccountTypeEnum } from '../value-objects/account-type.vo';
import { AccountRole, AccountRoleEnum } from '../value-objects/account-role.vo';
import {
  AccountStatus,
  AccountStatusEnum,
} from '../value-objects/account-status.vo';
import {
  InvitationStatus,
  InvitationStatusEnum,
} from '../value-objects/invitation-status.vo';
import { SocialLinks } from '../value-objects/social-links.vo';
import { ServiceArea } from '../value-objects/service-area.vo';
import { PriceRange } from '../value-objects/price-range.vo';
import { WorkingHours } from '../value-objects/working-hours.vo';
import { ValidationException } from '../../../../shared/exceptions/domain.exception';
import { AccountCreatedEvent } from '../events/account-created.event';
import { AccountApprovedEvent } from '../events/account-approved.event';
import { AccountRejectedEvent } from '../events/account-rejected.event';
import { AccountSuspendedEvent } from '../events/account-suspended.event';

const ACCOUNT_ID_PREFIX = 'acc';

export interface AccountProps {
  id: string;
  userId: string;
  organizationId?: string | null;
  type: AccountType;
  role?: AccountRole | null;
  displayName: string;
  specialization?: string | null;
  portfolio?: string | null;
  personalBio?: string | null;
  status: AccountStatus;
  invitationStatus?: InvitationStatus | null;
  invitationToken?: string | null;
  invitedAt?: Date | null;
  acceptedAt?: Date | null;
  isActive: boolean;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Media fields
  avatarUrl?: string | null;
  coverImageUrl?: string | null;
  videoIntroUrl?: string | null;
  // Contact & Social fields
  phone?: string | null;
  businessEmail?: string | null;
  website?: string | null;
  socialLinks?: SocialLinks | null;
  // Professional/Service fields
  tagline?: string | null;
  serviceAreas?: ServiceArea[];
  languages?: string[];
  workingHours?: WorkingHours | null;
  priceRange?: PriceRange | null;
  // Trust & Verification fields
  isVerified: boolean;
  verifiedAt?: Date | null;
  badges?: string[];
  rating?: number | null;
  totalReviews: number;
  completedBookings: number;
  // Address fields
  street?: string | null;
  ward?: string | null;
  district?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CreateIndividualAccountProps {
  userId: string;
  displayName: string;
  specialization?: string;
  portfolio?: string;
  personalBio?: string;
}

export interface CreateBusinessOwnerAccountProps {
  userId: string;
  organizationId: string;
  displayName: string;
}

export interface CreateMemberInvitationProps {
  organizationId: string;
  email: string;
  role: AccountRoleEnum;
  displayName: string;
}

export class Account extends AggregateRoot {
  private readonly _id: string;
  private readonly _userId: string;
  private _organizationId: string | null;
  private readonly _type: AccountType;
  private _role: AccountRole | null;
  private _displayName: string;
  private _specialization: string | null;
  private _portfolio: string | null;
  private _personalBio: string | null;
  private _status: AccountStatus;
  private _invitationStatus: InvitationStatus | null;
  private readonly _invitationToken: string | null;
  private readonly _invitedAt: Date | null;
  private _acceptedAt: Date | null;
  private _isActive: boolean;
  private _approvedAt: Date | null;
  private _approvedBy: string | null;
  private _rejectionReason: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  // Media fields
  private _avatarUrl: string | null;
  private _coverImageUrl: string | null;
  private _videoIntroUrl: string | null;
  // Contact & Social fields
  private _phone: string | null;
  private _businessEmail: string | null;
  private _website: string | null;
  private _socialLinks: SocialLinks | null;
  // Professional/Service fields
  private _tagline: string | null;
  private _serviceAreas: ServiceArea[];
  private _languages: string[];
  private _workingHours: WorkingHours | null;
  private _priceRange: PriceRange | null;
  // Trust & Verification fields
  private _isVerified: boolean;
  private _verifiedAt: Date | null;
  private _badges: string[];
  private _rating: number | null;
  private _totalReviews: number;
  private _completedBookings: number;
  // Address fields
  private _street: string | null;
  private _ward: string | null;
  private _district: string | null;
  private _city: string | null;
  private _latitude: number | null;
  private _longitude: number | null;

  private constructor(props: AccountProps) {
    super();
    this._id = props.id;
    this._userId = props.userId;
    this._organizationId = props.organizationId ?? null;
    this._type = props.type;
    this._role = props.role ?? null;
    this._displayName = props.displayName;
    this._specialization = props.specialization ?? null;
    this._portfolio = props.portfolio ?? null;
    this._personalBio = props.personalBio ?? null;
    this._status = props.status;
    this._invitationStatus = props.invitationStatus ?? null;
    this._invitationToken = props.invitationToken ?? null;
    this._invitedAt = props.invitedAt ?? null;
    this._acceptedAt = props.acceptedAt ?? null;
    this._isActive = props.isActive;
    this._approvedAt = props.approvedAt ?? null;
    this._approvedBy = props.approvedBy ?? null;
    this._rejectionReason = props.rejectionReason ?? null;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    // Media fields
    this._avatarUrl = props.avatarUrl ?? null;
    this._coverImageUrl = props.coverImageUrl ?? null;
    this._videoIntroUrl = props.videoIntroUrl ?? null;
    // Contact & Social fields
    this._phone = props.phone ?? null;
    this._businessEmail = props.businessEmail ?? null;
    this._website = props.website ?? null;
    this._socialLinks = props.socialLinks ?? null;
    // Professional/Service fields
    this._tagline = props.tagline ?? null;
    this._serviceAreas = props.serviceAreas ?? [];
    this._languages = props.languages ?? [];
    this._workingHours = props.workingHours ?? null;
    this._priceRange = props.priceRange ?? null;
    // Trust & Verification fields
    this._isVerified = props.isVerified ?? false;
    this._verifiedAt = props.verifiedAt ?? null;
    this._badges = props.badges ?? [];
    this._rating = props.rating ?? null;
    this._totalReviews = props.totalReviews ?? 0;
    this._completedBookings = props.completedBookings ?? 0;
    // Address fields
    this._street = props.street ?? null;
    this._ward = props.ward ?? null;
    this._district = props.district ?? null;
    this._city = props.city ?? null;
    this._latitude = props.latitude ?? null;
    this._longitude = props.longitude ?? null;
  }

  static createIndividual(props: CreateIndividualAccountProps): Account {
    const now = new Date();
    const account = new Account({
      id: `${ACCOUNT_ID_PREFIX}_${createId()}`,
      userId: props.userId,
      organizationId: null,
      type: AccountType.individual(),
      role: null,
      displayName: props.displayName,
      specialization: props.specialization,
      portfolio: props.portfolio,
      personalBio: props.personalBio,
      status: AccountStatus.pending(),
      invitationStatus: null,
      invitationToken: null,
      invitedAt: null,
      acceptedAt: null,
      isActive: true,
      approvedAt: null,
      approvedBy: null,
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
      // Media fields
      avatarUrl: null,
      coverImageUrl: null,
      videoIntroUrl: null,
      // Contact & Social fields
      phone: null,
      businessEmail: null,
      website: null,
      socialLinks: null,
      // Professional/Service fields
      tagline: null,
      serviceAreas: [],
      languages: [],
      workingHours: null,
      priceRange: null,
      // Trust & Verification fields
      isVerified: false,
      verifiedAt: null,
      badges: [],
      rating: null,
      totalReviews: 0,
      completedBookings: 0,
    });

    account.apply(
      new AccountCreatedEvent(
        account.id,
        account.userId,
        AccountTypeEnum.INDIVIDUAL,
        null,
      ),
    );

    return account;
  }

  static createBusinessOwner(props: CreateBusinessOwnerAccountProps): Account {
    const now = new Date();
    const account = new Account({
      id: `${ACCOUNT_ID_PREFIX}_${createId()}`,
      userId: props.userId,
      organizationId: props.organizationId,
      type: AccountType.business(),
      role: AccountRole.owner(),
      displayName: props.displayName,
      specialization: null,
      portfolio: null,
      personalBio: null,
      status: AccountStatus.pending(),
      invitationStatus: InvitationStatus.accepted(),
      invitationToken: null,
      invitedAt: now,
      acceptedAt: now,
      isActive: true,
      approvedAt: null,
      approvedBy: null,
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
      // Media fields
      avatarUrl: null,
      coverImageUrl: null,
      videoIntroUrl: null,
      // Contact & Social fields
      phone: null,
      businessEmail: null,
      website: null,
      socialLinks: null,
      // Professional/Service fields
      tagline: null,
      serviceAreas: [],
      languages: [],
      workingHours: null,
      priceRange: null,
      // Trust & Verification fields
      isVerified: false,
      verifiedAt: null,
      badges: [],
      rating: null,
      totalReviews: 0,
      completedBookings: 0,
    });

    account.apply(
      new AccountCreatedEvent(
        account.id,
        account.userId,
        AccountTypeEnum.BUSINESS,
        props.organizationId,
      ),
    );

    return account;
  }

  static createInvitation(props: CreateMemberInvitationProps): Account {
    if (props.role === AccountRoleEnum.OWNER) {
      throw new ValidationException('Cannot invite as owner');
    }

    const now = new Date();
    const token = createId();

    return new Account({
      id: `${ACCOUNT_ID_PREFIX}_${createId()}`,
      userId: '', // Will be set when invitation is accepted
      organizationId: props.organizationId,
      type: AccountType.business(),
      role: AccountRole.fromString(props.role),
      displayName: props.displayName,
      specialization: null,
      portfolio: null,
      personalBio: null,
      status: AccountStatus.pending(),
      invitationStatus: InvitationStatus.pending(),
      invitationToken: token,
      invitedAt: now,
      acceptedAt: null,
      isActive: false,
      approvedAt: null,
      approvedBy: null,
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
      // Media fields
      avatarUrl: null,
      coverImageUrl: null,
      videoIntroUrl: null,
      // Contact & Social fields
      phone: null,
      businessEmail: null,
      website: null,
      socialLinks: null,
      // Professional/Service fields
      tagline: null,
      serviceAreas: [],
      languages: [],
      workingHours: null,
      priceRange: null,
      // Trust & Verification fields
      isVerified: false,
      verifiedAt: null,
      badges: [],
      rating: null,
      totalReviews: 0,
      completedBookings: 0,
    });
  }

  static reconstitute(props: AccountProps): Account {
    return new Account(props);
  }

  acceptInvitation(userId: string): void {
    if (!this._invitationStatus?.canBeAccepted()) {
      throw new ValidationException('Invitation cannot be accepted');
    }
    (this as unknown as { _userId: string })._userId = userId;
    this._invitationStatus = InvitationStatus.accepted();
    this._acceptedAt = new Date();
    this._isActive = true;
    this._updatedAt = new Date();
  }

  declineInvitation(): void {
    if (!this._invitationStatus?.canBeDeclined()) {
      throw new ValidationException('Invitation cannot be declined');
    }
    this._invitationStatus = InvitationStatus.declined();
    this._updatedAt = new Date();
  }

  expireInvitation(): void {
    if (!this._invitationStatus?.isPending()) {
      throw new ValidationException('Only pending invitations can expire');
    }
    this._invitationStatus = InvitationStatus.expired();
    this._updatedAt = new Date();
  }

  approve(approvedBy: string): void {
    if (!this._status.canBeApproved()) {
      throw new ValidationException(
        'Account cannot be approved in current status',
      );
    }

    this._status = AccountStatus.active();
    this._approvedAt = new Date();
    this._approvedBy = approvedBy;
    this._rejectionReason = null;
    this._updatedAt = new Date();

    this.apply(new AccountApprovedEvent(this._id, this._userId, approvedBy));
  }

  reject(rejectedBy: string, reason: string): void {
    if (!this._status.canBeApproved()) {
      throw new ValidationException(
        'Account cannot be rejected in current status',
      );
    }

    this._status = AccountStatus.rejected();
    this._rejectionReason = reason;
    this._updatedAt = new Date();

    this.apply(
      new AccountRejectedEvent(this._id, this._userId, rejectedBy, reason),
    );
  }

  suspend(reason: string): void {
    if (!this._status.canBeSuspended()) {
      throw new ValidationException(
        'Account cannot be suspended in current status',
      );
    }

    this._status = AccountStatus.suspended();
    this._updatedAt = new Date();

    this.apply(new AccountSuspendedEvent(this._id, this._userId, reason));
  }

  reactivate(): void {
    if (!this._status.canBeReactivated()) {
      throw new ValidationException(
        'Account cannot be reactivated in current status',
      );
    }

    this._status = AccountStatus.active();
    this._updatedAt = new Date();
  }

  changeRole(newRole: AccountRoleEnum): void {
    if (!this._role) {
      throw new ValidationException(
        'Cannot change role for individual account',
      );
    }
    if (this._role.isOwner()) {
      throw new ValidationException('Cannot change owner role');
    }
    if (newRole === AccountRoleEnum.OWNER) {
      throw new ValidationException('Cannot change role to owner');
    }
    this._role = AccountRole.fromString(newRole);
    this._updatedAt = new Date();
  }

  deactivate(): void {
    if (this._role?.isOwner()) {
      throw new ValidationException('Cannot deactivate owner');
    }
    this._isActive = false;
    this._updatedAt = new Date();
  }

  activate(): void {
    if (this._invitationStatus && !this._invitationStatus.isAccepted()) {
      throw new ValidationException('Can only activate accepted invitation');
    }
    this._isActive = true;
    this._updatedAt = new Date();
  }

  updateProfile(props: {
    displayName?: string;
    specialization?: string;
    portfolio?: string;
    personalBio?: string;
  }): void {
    if (props.displayName !== undefined) {
      this._displayName = props.displayName;
    }
    if (props.specialization !== undefined) {
      this._specialization = props.specialization;
    }
    if (props.portfolio !== undefined) {
      this._portfolio = props.portfolio;
    }
    if (props.personalBio !== undefined) {
      this._personalBio = props.personalBio;
    }
    this._updatedAt = new Date();
  }

  updateMedia(props: {
    avatarUrl?: string | null;
    coverImageUrl?: string | null;
    videoIntroUrl?: string | null;
  }): void {
    if (props.avatarUrl !== undefined) {
      this._avatarUrl = props.avatarUrl;
    }
    if (props.coverImageUrl !== undefined) {
      this._coverImageUrl = props.coverImageUrl;
    }
    if (props.videoIntroUrl !== undefined) {
      this._videoIntroUrl = props.videoIntroUrl;
    }
    this._updatedAt = new Date();
  }

  updateContactInfo(props: {
    phone?: string | null;
    businessEmail?: string | null;
    website?: string | null;
    socialLinks?: SocialLinks | null;
  }): void {
    if (props.phone !== undefined) {
      this._phone = props.phone;
    }
    if (props.businessEmail !== undefined) {
      this._businessEmail = props.businessEmail;
    }
    if (props.website !== undefined) {
      this._website = props.website;
    }
    if (props.socialLinks !== undefined) {
      this._socialLinks = props.socialLinks;
    }
    this._updatedAt = new Date();
  }

  updateProfessionalInfo(props: {
    tagline?: string | null;
    serviceAreas?: ServiceArea[];
    languages?: string[];
    workingHours?: WorkingHours | null;
    priceRange?: PriceRange | null;
  }): void {
    if (props.tagline !== undefined) {
      this._tagline = props.tagline;
    }
    if (props.serviceAreas !== undefined) {
      this._serviceAreas = props.serviceAreas;
    }
    if (props.languages !== undefined) {
      this._languages = props.languages;
    }
    if (props.workingHours !== undefined) {
      this._workingHours = props.workingHours;
    }
    if (props.priceRange !== undefined) {
      this._priceRange = props.priceRange;
    }
    this._updatedAt = new Date();
  }

  verify(): void {
    if (this._isVerified) {
      throw new ValidationException('Account is already verified');
    }
    this._isVerified = true;
    this._verifiedAt = new Date();
    this._updatedAt = new Date();
  }

  unverify(): void {
    this._isVerified = false;
    this._verifiedAt = null;
    this._updatedAt = new Date();
  }

  addBadge(badge: string): void {
    if (!this._badges.includes(badge)) {
      this._badges.push(badge);
      this._updatedAt = new Date();
    }
  }

  removeBadge(badge: string): void {
    const index = this._badges.indexOf(badge);
    if (index > -1) {
      this._badges.splice(index, 1);
      this._updatedAt = new Date();
    }
  }

  updateRating(rating: number, totalReviews: number): void {
    if (rating < 0 || rating > 5) {
      throw new ValidationException('Rating must be between 0 and 5');
    }
    this._rating = rating;
    this._totalReviews = totalReviews;
    this._updatedAt = new Date();
  }

  incrementCompletedBookings(): void {
    this._completedBookings += 1;
    this._updatedAt = new Date();
  }

  canManageOrganization(): boolean {
    return this._role?.canManageOrganization() ?? false;
  }

  canManageMembers(): boolean {
    return this._role?.canManageMembers() ?? false;
  }

  canManageServices(): boolean {
    return this._role?.canManageServices() ?? false;
  }

  canOperate(): boolean {
    return this._status.canOperate() && this._isActive;
  }

  isIndividual(): boolean {
    return this._type.isIndividual();
  }

  isBusiness(): boolean {
    return this._type.isBusiness();
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get organizationId(): string | null {
    return this._organizationId;
  }

  get type(): AccountType {
    return this._type;
  }

  get typeValue(): AccountTypeEnum {
    return this._type.value;
  }

  get role(): AccountRole | null {
    return this._role;
  }

  get roleValue(): AccountRoleEnum | null {
    return this._role?.value ?? null;
  }

  get displayName(): string {
    return this._displayName;
  }

  get specialization(): string | null {
    return this._specialization;
  }

  get portfolio(): string | null {
    return this._portfolio;
  }

  get personalBio(): string | null {
    return this._personalBio;
  }

  get status(): AccountStatus {
    return this._status;
  }

  get statusValue(): AccountStatusEnum {
    return this._status.value;
  }

  get invitationStatus(): InvitationStatus | null {
    return this._invitationStatus;
  }

  get invitationStatusValue(): InvitationStatusEnum | null {
    return this._invitationStatus?.value ?? null;
  }

  get invitationToken(): string | null {
    return this._invitationToken;
  }

  get invitedAt(): Date | null {
    return this._invitedAt;
  }

  get acceptedAt(): Date | null {
    return this._acceptedAt;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get approvedAt(): Date | null {
    return this._approvedAt;
  }

  get approvedBy(): string | null {
    return this._approvedBy;
  }

  get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Media getters
  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get coverImageUrl(): string | null {
    return this._coverImageUrl;
  }

  get videoIntroUrl(): string | null {
    return this._videoIntroUrl;
  }

  // Contact & Social getters
  get phone(): string | null {
    return this._phone;
  }

  get businessEmail(): string | null {
    return this._businessEmail;
  }

  get website(): string | null {
    return this._website;
  }

  get socialLinks(): SocialLinks | null {
    return this._socialLinks;
  }

  // Professional/Service getters
  get tagline(): string | null {
    return this._tagline;
  }

  get serviceAreas(): ServiceArea[] {
    return this._serviceAreas;
  }

  get languages(): string[] {
    return this._languages;
  }

  get workingHours(): WorkingHours | null {
    return this._workingHours;
  }

  get priceRange(): PriceRange | null {
    return this._priceRange;
  }

  // Trust & Verification getters
  get isVerified(): boolean {
    return this._isVerified;
  }

  get verifiedAt(): Date | null {
    return this._verifiedAt;
  }

  get badges(): string[] {
    return this._badges;
  }

  get rating(): number | null {
    return this._rating;
  }

  get totalReviews(): number {
    return this._totalReviews;
  }

  get completedBookings(): number {
    return this._completedBookings;
  }

  // Address getters
  get street(): string | null {
    return this._street;
  }

  get ward(): string | null {
    return this._ward;
  }

  get district(): string | null {
    return this._district;
  }

  get city(): string | null {
    return this._city;
  }

  get latitude(): number | null {
    return this._latitude;
  }

  get longitude(): number | null {
    return this._longitude;
  }

  get fullAddress(): string | null {
    if (!this._street && !this._ward && !this._district && !this._city) {
      return null;
    }
    return [this._street, this._ward, this._district, this._city]
      .filter(Boolean)
      .join(', ');
  }

  toObject(): Record<string, unknown> {
    return {
      id: this._id,
      userId: this._userId,
      organizationId: this._organizationId,
      type: this._type.value,
      role: this._role?.value ?? null,
      displayName: this._displayName,
      specialization: this._specialization,
      portfolio: this._portfolio,
      personalBio: this._personalBio,
      status: this._status.value,
      invitationStatus: this._invitationStatus?.value ?? null,
      invitationToken: this._invitationToken,
      invitedAt: this._invitedAt,
      acceptedAt: this._acceptedAt,
      isActive: this._isActive,
      approvedAt: this._approvedAt,
      approvedBy: this._approvedBy,
      rejectionReason: this._rejectionReason,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      // Media fields
      avatarUrl: this._avatarUrl,
      coverImageUrl: this._coverImageUrl,
      videoIntroUrl: this._videoIntroUrl,
      // Contact & Social fields
      phone: this._phone,
      businessEmail: this._businessEmail,
      website: this._website,
      socialLinks: this._socialLinks?.toJSON() ?? null,
      // Professional/Service fields
      tagline: this._tagline,
      serviceAreas: this._serviceAreas.map((sa) => sa.toJSON()),
      languages: this._languages,
      workingHours: this._workingHours?.toJSON() ?? null,
      priceRange: this._priceRange?.toJSON() ?? null,
      // Trust & Verification fields
      isVerified: this._isVerified,
      verifiedAt: this._verifiedAt,
      badges: this._badges,
      rating: this._rating,
      totalReviews: this._totalReviews,
      completedBookings: this._completedBookings,
    };
  }
}
