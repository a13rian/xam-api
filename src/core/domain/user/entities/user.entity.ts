import { AggregateRoot } from '@nestjs/cqrs';
import { createId } from '@paralleldrive/cuid2';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { Gender, GenderEnum } from '../value-objects/gender.vo';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserUpdatedEvent } from '../events/user-updated.event';

const USER_ID_PREFIX = 'usr';

export interface UserProps {
  id?: string;
  email: Email;
  password: Password;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  phone?: string | null;
  dateOfBirth?: Date | null;
  gender?: Gender | null;
  isActive?: boolean;
  emailVerifiedAt?: Date | null;
  roleIds?: string[];
  roleNames?: string[];
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserProps {
  email: Email;
  password: Password;
  firstName: string;
  lastName: string;
  roleIds?: string[];
}

export class User extends AggregateRoot {
  private readonly _id: string;
  private _email: Email;
  private _password: Password;
  private _firstName: string;
  private _lastName: string;
  private _avatarUrl: string | null;
  private _phone: string | null;
  private _dateOfBirth: Date | null;
  private _gender: Gender | null;
  private _isActive: boolean;
  private _emailVerifiedAt: Date | null;
  private _roleIds: string[];
  private _roleNames: string[];
  private _failedLoginAttempts: number;
  private _lockedUntil: Date | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: UserProps) {
    super();
    this._id = props.id || `${USER_ID_PREFIX}_${createId()}`;
    this._email = props.email;
    this._password = props.password;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._avatarUrl = props.avatarUrl ?? null;
    this._phone = props.phone ?? null;
    this._dateOfBirth = props.dateOfBirth ?? null;
    this._gender = props.gender ?? null;
    this._isActive = props.isActive ?? true;
    this._emailVerifiedAt = props.emailVerifiedAt ?? null;
    this._roleIds = props.roleIds ?? [];
    this._roleNames = props.roleNames ?? [];
    this._failedLoginAttempts = props.failedLoginAttempts ?? 0;
    this._lockedUntil = props.lockedUntil ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: CreateUserProps): User {
    const user = new User({
      email: props.email,
      password: props.password,
      firstName: props.firstName,
      lastName: props.lastName,
      roleIds: props.roleIds,
    });

    user.apply(new UserCreatedEvent(user.id, user.email.value));
    return user;
  }

  public static reconstitute(props: UserProps): User {
    return new User(props);
  }

  public update(props: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    dateOfBirth?: Date | null;
    gender?: GenderEnum | null;
  }): void {
    if (props.firstName !== undefined) {
      this._firstName = props.firstName;
    }
    if (props.lastName !== undefined) {
      this._lastName = props.lastName;
    }
    if (props.phone !== undefined) {
      this._phone = props.phone;
    }
    if (props.dateOfBirth !== undefined) {
      this._dateOfBirth = props.dateOfBirth;
    }
    if (props.gender !== undefined) {
      this._gender = props.gender ? Gender.fromString(props.gender) : null;
    }
    this._updatedAt = new Date();
    this.apply(new UserUpdatedEvent(this._id));
  }

  public changePassword(newPassword: Password): void {
    this._password = newPassword;
    this._updatedAt = new Date();
  }

  public assignRole(roleId: string): void {
    if (!this._roleIds.includes(roleId)) {
      this._roleIds.push(roleId);
      this._updatedAt = new Date();
    }
  }

  public removeRole(roleId: string): void {
    this._roleIds = this._roleIds.filter((id) => id !== roleId);
    this._updatedAt = new Date();
  }

  public setRoles(roleIds: string[]): void {
    this._roleIds = [...roleIds];
    this._updatedAt = new Date();
  }

  public hasRole(roleId: string): boolean {
    return this._roleIds.includes(roleId);
  }

  public deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  public activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  public verifyEmail(): void {
    this._emailVerifiedAt = new Date();
    this._updatedAt = new Date();
  }

  public recordFailedLogin(): void {
    this._failedLoginAttempts += 1;
    if (this._failedLoginAttempts >= 5) {
      this._lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
    this._updatedAt = new Date();
  }

  public resetFailedLoginAttempts(): void {
    this._failedLoginAttempts = 0;
    this._lockedUntil = null;
    this._updatedAt = new Date();
  }

  public recordSuccessfulLogin(): void {
    this.resetFailedLoginAttempts();
  }

  public unlock(): void {
    this._lockedUntil = null;
    this._failedLoginAttempts = 0;
    this._updatedAt = new Date();
  }

  public updateAvatar(avatarUrl: string | null): void {
    this._avatarUrl = avatarUrl;
    this._updatedAt = new Date();
  }

  public get isLocked(): boolean {
    if (!this._lockedUntil) return false;
    if (this._lockedUntil <= new Date()) {
      this._lockedUntil = null;
      this._failedLoginAttempts = 0;
      return false;
    }
    return true;
  }

  get id(): string {
    return this._id;
  }
  get email(): Email {
    return this._email;
  }
  get password(): Password {
    return this._password;
  }
  get firstName(): string {
    return this._firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }
  get avatarUrl(): string | null {
    return this._avatarUrl;
  }
  get phone(): string | null {
    return this._phone;
  }
  get dateOfBirth(): Date | null {
    return this._dateOfBirth;
  }
  get gender(): Gender | null {
    return this._gender;
  }
  get genderValue(): GenderEnum | null {
    return this._gender?.value ?? null;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get emailVerifiedAt(): Date | null {
    return this._emailVerifiedAt;
  }
  get isEmailVerified(): boolean {
    return this._emailVerifiedAt !== null;
  }
  get roleIds(): readonly string[] {
    return [...this._roleIds];
  }
  get roleNames(): readonly string[] {
    return [...this._roleNames];
  }
  get failedLoginAttempts(): number {
    return this._failedLoginAttempts;
  }
  get lockedUntil(): Date | null {
    return this._lockedUntil;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
