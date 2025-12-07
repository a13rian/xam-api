import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export interface CreateEmailVerificationTokenProps {
  userId: string;
  expiresInHours?: number;
}

export interface EmailVerificationTokenProps {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

export class EmailVerificationToken {
  private readonly _id: string;
  private readonly _token: string;
  private readonly _userId: string;
  private readonly _expiresAt: Date;
  private _isUsed: boolean;
  private readonly _createdAt: Date;

  private constructor(props: EmailVerificationTokenProps) {
    this._id = props.id;
    this._token = props.token;
    this._userId = props.userId;
    this._expiresAt = props.expiresAt;
    this._isUsed = props.isUsed;
    this._createdAt = props.createdAt;
  }

  public static create(
    props: CreateEmailVerificationTokenProps,
  ): EmailVerificationToken {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(
      Date.now() + (props.expiresInHours ?? 24) * 60 * 60 * 1000,
    );

    return new EmailVerificationToken({
      id: uuidv4(),
      token,
      userId: props.userId,
      expiresAt,
      isUsed: false,
      createdAt: new Date(),
    });
  }

  public static reconstitute(
    props: EmailVerificationTokenProps,
  ): EmailVerificationToken {
    return new EmailVerificationToken(props);
  }

  public markAsUsed(): void {
    this._isUsed = true;
  }

  get id(): string {
    return this._id;
  }
  get token(): string {
    return this._token;
  }
  get userId(): string {
    return this._userId;
  }
  get expiresAt(): Date {
    return this._expiresAt;
  }
  get isUsed(): boolean {
    return this._isUsed;
  }
  get isExpired(): boolean {
    return this._expiresAt <= new Date();
  }
  get createdAt(): Date {
    return this._createdAt;
  }
}
