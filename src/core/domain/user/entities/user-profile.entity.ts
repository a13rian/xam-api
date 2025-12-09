import { AggregateRoot } from '@nestjs/cqrs';
import { Gender, GenderEnum } from '../value-objects/gender.vo';

export interface UserProfileProps {
  userId: string;
  avatar?: string | null;
  bio?: string | null;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: Date | null;
  gender?: Gender | null;
  preferences?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserProfileProps {
  userId: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: GenderEnum;
  preferences?: Record<string, unknown>;
}

export class UserProfile extends AggregateRoot {
  private readonly _userId: string;
  private _avatar: string | null;
  private _bio: string | null;
  private _phone: string | null;
  private _address: string | null;
  private _dateOfBirth: Date | null;
  private _gender: Gender | null;
  private _preferences: Record<string, unknown>;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: UserProfileProps) {
    super();
    this._userId = props.userId;
    this._avatar = props.avatar ?? null;
    this._bio = props.bio ?? null;
    this._phone = props.phone ?? null;
    this._address = props.address ?? null;
    this._dateOfBirth = props.dateOfBirth ?? null;
    this._gender = props.gender ?? null;
    this._preferences = props.preferences ?? {};
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: CreateUserProfileProps): UserProfile {
    return new UserProfile({
      userId: props.userId,
      avatar: props.avatar,
      bio: props.bio,
      phone: props.phone,
      address: props.address,
      dateOfBirth: props.dateOfBirth,
      gender: props.gender ? Gender.fromString(props.gender) : null,
      preferences: props.preferences,
    });
  }

  public static reconstitute(props: UserProfileProps): UserProfile {
    return new UserProfile(props);
  }

  public update(props: {
    avatar?: string | null;
    bio?: string | null;
    phone?: string | null;
    address?: string | null;
    dateOfBirth?: Date | null;
    gender?: GenderEnum | null;
    preferences?: Record<string, unknown>;
  }): void {
    if (props.avatar !== undefined) {
      this._avatar = props.avatar;
    }
    if (props.bio !== undefined) {
      this._bio = props.bio;
    }
    if (props.phone !== undefined) {
      this._phone = props.phone;
    }
    if (props.address !== undefined) {
      this._address = props.address;
    }
    if (props.dateOfBirth !== undefined) {
      this._dateOfBirth = props.dateOfBirth;
    }
    if (props.gender !== undefined) {
      this._gender = props.gender ? Gender.fromString(props.gender) : null;
    }
    if (props.preferences !== undefined) {
      this._preferences = props.preferences;
    }
    this._updatedAt = new Date();
  }

  get userId(): string {
    return this._userId;
  }

  get avatar(): string | null {
    return this._avatar;
  }

  get bio(): string | null {
    return this._bio;
  }

  get phone(): string | null {
    return this._phone;
  }

  get address(): string | null {
    return this._address;
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

  get preferences(): Record<string, unknown> {
    return { ...this._preferences };
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
