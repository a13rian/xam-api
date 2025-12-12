import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
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
import { ValidationException } from '../../../../shared/exceptions/domain.exception';
import { AccountCreatedEvent } from '../events/account-created.event';
import { AccountApprovedEvent } from '../events/account-approved.event';
import { AccountRejectedEvent } from '../events/account-rejected.event';
import { AccountSuspendedEvent } from '../events/account-suspended.event';

export interface AccountProps {
  id: string;
  userId: string;
  organizationId?: string | null;
  type: AccountType;
  role?: AccountRole | null;
  displayName: string;
  specialization?: string | null;
  yearsExperience?: number | null;
  certifications?: string[];
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
}

export interface CreateIndividualAccountProps {
  userId: string;
  displayName: string;
  specialization?: string;
  yearsExperience?: number;
  certifications?: string[];
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
  private _yearsExperience: number | null;
  private _certifications: string[];
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

  private constructor(props: AccountProps) {
    super();
    this._id = props.id;
    this._userId = props.userId;
    this._organizationId = props.organizationId ?? null;
    this._type = props.type;
    this._role = props.role ?? null;
    this._displayName = props.displayName;
    this._specialization = props.specialization ?? null;
    this._yearsExperience = props.yearsExperience ?? null;
    this._certifications = props.certifications ?? [];
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
  }

  static createIndividual(props: CreateIndividualAccountProps): Account {
    const now = new Date();
    const account = new Account({
      id: uuidv4(),
      userId: props.userId,
      organizationId: null,
      type: AccountType.individual(),
      role: null,
      displayName: props.displayName,
      specialization: props.specialization,
      yearsExperience: props.yearsExperience,
      certifications: props.certifications ?? [],
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
      id: uuidv4(),
      userId: props.userId,
      organizationId: props.organizationId,
      type: AccountType.business(),
      role: AccountRole.owner(),
      displayName: props.displayName,
      specialization: null,
      yearsExperience: null,
      certifications: [],
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
    const token = uuidv4();

    return new Account({
      id: uuidv4(),
      userId: '', // Will be set when invitation is accepted
      organizationId: props.organizationId,
      type: AccountType.business(),
      role: AccountRole.fromString(props.role),
      displayName: props.displayName,
      specialization: null,
      yearsExperience: null,
      certifications: [],
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
    yearsExperience?: number;
    certifications?: string[];
    portfolio?: string;
    personalBio?: string;
  }): void {
    if (props.displayName !== undefined) {
      this._displayName = props.displayName;
    }
    if (props.specialization !== undefined) {
      this._specialization = props.specialization;
    }
    if (props.yearsExperience !== undefined) {
      this._yearsExperience = props.yearsExperience;
    }
    if (props.certifications !== undefined) {
      this._certifications = props.certifications;
    }
    if (props.portfolio !== undefined) {
      this._portfolio = props.portfolio;
    }
    if (props.personalBio !== undefined) {
      this._personalBio = props.personalBio;
    }
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

  get yearsExperience(): number | null {
    return this._yearsExperience;
  }

  get certifications(): string[] {
    return this._certifications;
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

  toObject(): Record<string, unknown> {
    return {
      id: this._id,
      userId: this._userId,
      organizationId: this._organizationId,
      type: this._type.value,
      role: this._role?.value ?? null,
      displayName: this._displayName,
      specialization: this._specialization,
      yearsExperience: this._yearsExperience,
      certifications: this._certifications,
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
    };
  }
}
