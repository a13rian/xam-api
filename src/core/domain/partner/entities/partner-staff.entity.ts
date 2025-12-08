import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { StaffRole, StaffRoleEnum } from '../value-objects/staff-role.vo';
import {
  InvitationStatus,
  InvitationStatusEnum,
} from '../value-objects/invitation-status.vo';
import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export interface PartnerStaffProps {
  id: string;
  partnerId: string;
  userId?: string;
  email: string;
  role: StaffRole;
  invitationStatus: InvitationStatus;
  invitationToken?: string;
  invitedAt: Date;
  acceptedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PartnerStaff extends AggregateRoot {
  private readonly _id: string;
  private readonly _partnerId: string;
  private _userId?: string;
  private readonly _email: string;
  private _role: StaffRole;
  private _invitationStatus: InvitationStatus;
  private readonly _invitationToken?: string;
  private readonly _invitedAt: Date;
  private _acceptedAt?: Date;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PartnerStaffProps) {
    super();
    this._id = props.id;
    this._partnerId = props.partnerId;
    this._userId = props.userId;
    this._email = props.email;
    this._role = props.role;
    this._invitationStatus = props.invitationStatus;
    this._invitationToken = props.invitationToken;
    this._invitedAt = props.invitedAt;
    this._acceptedAt = props.acceptedAt;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static createInvitation(props: {
    partnerId: string;
    email: string;
    role: StaffRoleEnum;
  }): PartnerStaff {
    const now = new Date();
    const token = uuidv4();

    return new PartnerStaff({
      id: uuidv4(),
      partnerId: props.partnerId,
      email: props.email,
      role: StaffRole.fromString(props.role),
      invitationStatus: InvitationStatus.pending(),
      invitationToken: token,
      invitedAt: now,
      isActive: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static createOwner(props: {
    partnerId: string;
    userId: string;
    email: string;
  }): PartnerStaff {
    const now = new Date();

    return new PartnerStaff({
      id: uuidv4(),
      partnerId: props.partnerId,
      userId: props.userId,
      email: props.email,
      role: StaffRole.owner(),
      invitationStatus: InvitationStatus.accepted(),
      invitedAt: now,
      acceptedAt: now,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: PartnerStaffProps): PartnerStaff {
    return new PartnerStaff(props);
  }

  accept(userId: string): void {
    if (!this._invitationStatus.canBeAccepted()) {
      throw new ValidationException('Invitation cannot be accepted');
    }
    this._userId = userId;
    this._invitationStatus = InvitationStatus.accepted();
    this._acceptedAt = new Date();
    this._isActive = true;
    this._updatedAt = new Date();
  }

  decline(): void {
    if (!this._invitationStatus.canBeDeclined()) {
      throw new ValidationException('Invitation cannot be declined');
    }
    this._invitationStatus = InvitationStatus.declined();
    this._updatedAt = new Date();
  }

  expire(): void {
    if (!this._invitationStatus.isPending()) {
      throw new ValidationException('Only pending invitations can expire');
    }
    this._invitationStatus = InvitationStatus.expired();
    this._updatedAt = new Date();
  }

  changeRole(newRole: StaffRoleEnum): void {
    if (this._role.isOwner()) {
      throw new ValidationException('Cannot change owner role');
    }
    this._role = StaffRole.fromString(newRole);
    this._updatedAt = new Date();
  }

  deactivate(): void {
    if (this._role.isOwner()) {
      throw new ValidationException('Cannot deactivate owner');
    }
    this._isActive = false;
    this._updatedAt = new Date();
  }

  activate(): void {
    if (!this._invitationStatus.isAccepted()) {
      throw new ValidationException('Can only activate accepted staff');
    }
    this._isActive = true;
    this._updatedAt = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get partnerId(): string {
    return this._partnerId;
  }
  get userId(): string | undefined {
    return this._userId;
  }
  get email(): string {
    return this._email;
  }
  get role(): StaffRole {
    return this._role;
  }
  get invitationStatus(): InvitationStatus {
    return this._invitationStatus;
  }
  get invitationToken(): string | undefined {
    return this._invitationToken;
  }
  get invitedAt(): Date {
    return this._invitedAt;
  }
  get acceptedAt(): Date | undefined {
    return this._acceptedAt;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  toObject(): {
    id: string;
    partnerId: string;
    userId?: string;
    email: string;
    role: string;
    invitationStatus: string;
    invitationToken?: string;
    invitedAt: Date;
    acceptedAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      partnerId: this._partnerId,
      userId: this._userId,
      email: this._email,
      role: this._role.value,
      invitationStatus: this._invitationStatus.value,
      invitationToken: this._invitationToken,
      invitedAt: this._invitedAt,
      acceptedAt: this._acceptedAt,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
