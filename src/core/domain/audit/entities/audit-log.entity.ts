import { v4 as uuidv4 } from 'uuid';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  STATUS_CHANGE = 'STATUS_CHANGE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  AVATAR_UPLOAD = 'AVATAR_UPLOAD',
  AVATAR_REMOVE = 'AVATAR_REMOVE',
}

export enum EntityType {
  USER = 'user',
  ACCOUNT = 'account',
  ROLE = 'role',
  BOOKING = 'booking',
  WALLET = 'wallet',
}

export interface AuditChanges {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  changedFields?: string[];
}

export interface AuditLogProps {
  id: string;
  entityType: EntityType;
  entityId: string;
  action: AuditAction;
  changes?: AuditChanges;
  performedById: string;
  performedByEmail: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  createdAt: Date;
}

export class AuditLog {
  private constructor(private readonly props: AuditLogProps) {}

  static create(params: {
    entityType: EntityType;
    entityId: string;
    action: AuditAction;
    changes?: AuditChanges;
    performedById: string;
    performedByEmail: string;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  }): AuditLog {
    return new AuditLog({
      id: uuidv4(),
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      changes: params.changes,
      performedById: params.performedById,
      performedByEmail: params.performedByEmail,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      requestId: params.requestId,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: AuditLogProps): AuditLog {
    return new AuditLog(props);
  }

  get id(): string {
    return this.props.id;
  }

  get entityType(): EntityType {
    return this.props.entityType;
  }

  get entityId(): string {
    return this.props.entityId;
  }

  get action(): AuditAction {
    return this.props.action;
  }

  get changes(): AuditChanges | undefined {
    return this.props.changes;
  }

  get performedById(): string {
    return this.props.performedById;
  }

  get performedByEmail(): string {
    return this.props.performedByEmail;
  }

  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }

  get userAgent(): string | undefined {
    return this.props.userAgent;
  }

  get requestId(): string | undefined {
    return this.props.requestId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
