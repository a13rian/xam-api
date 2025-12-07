import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export interface CreateRefreshTokenProps {
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  expiresInDays?: number;
}

export interface RefreshTokenProps {
  id: string;
  token: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

export class RefreshToken {
  private readonly _id: string;
  private readonly _token: string;
  private readonly _userId: string;
  private readonly _userAgent: string | undefined;
  private readonly _ipAddress: string | undefined;
  private readonly _expiresAt: Date;
  private _isRevoked: boolean;
  private readonly _createdAt: Date;

  private constructor(props: RefreshTokenProps) {
    this._id = props.id;
    this._token = props.token;
    this._userId = props.userId;
    this._userAgent = props.userAgent;
    this._ipAddress = props.ipAddress;
    this._expiresAt = props.expiresAt;
    this._isRevoked = props.isRevoked;
    this._createdAt = props.createdAt;
  }

  public static create(props: CreateRefreshTokenProps): RefreshToken {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(
      Date.now() + (props.expiresInDays ?? 7) * 24 * 60 * 60 * 1000,
    );

    return new RefreshToken({
      id: uuidv4(),
      token,
      userId: props.userId,
      userAgent: props.userAgent,
      ipAddress: props.ipAddress,
      expiresAt,
      isRevoked: false,
      createdAt: new Date(),
    });
  }

  public static reconstitute(props: RefreshTokenProps): RefreshToken {
    return new RefreshToken(props);
  }

  public revoke(): void {
    this._isRevoked = true;
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
  get userAgent(): string | undefined {
    return this._userAgent;
  }
  get ipAddress(): string | undefined {
    return this._ipAddress;
  }
  get expiresAt(): Date {
    return this._expiresAt;
  }
  get isRevoked(): boolean {
    return this._isRevoked;
  }
  get isExpired(): boolean {
    return this._expiresAt <= new Date();
  }
  get createdAt(): Date {
    return this._createdAt;
  }
}
