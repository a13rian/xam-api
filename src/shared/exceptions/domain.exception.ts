export abstract class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, identifier: string) {
    super(
      `${entityName} with identifier '${identifier}' not found`,
      'ENTITY_NOT_FOUND',
    );
  }
}

export class EntityAlreadyExistsException extends DomainException {
  constructor(entityName: string, identifier: string) {
    super(
      `${entityName} with identifier '${identifier}' already exists`,
      'ENTITY_ALREADY_EXISTS',
    );
  }
}

export class InvalidOperationException extends DomainException {
  constructor(message: string) {
    super(message, 'INVALID_OPERATION');
  }
}

export class ValidationException extends DomainException {
  constructor(
    message: string,
    public readonly errors: Record<string, string[]> = {},
  ) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class UnauthorizedException extends DomainException {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED');
  }
}

export class ForbiddenException extends DomainException {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN');
  }
}

export class AccountLockedException extends DomainException {
  constructor(lockedUntil: Date) {
    super(
      `Account is locked until ${lockedUntil.toISOString()}`,
      'ACCOUNT_LOCKED',
    );
  }
}

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS');
  }
}

export class EmailNotVerifiedException extends DomainException {
  constructor() {
    super('Email not verified', 'EMAIL_NOT_VERIFIED');
  }
}

export class TokenExpiredException extends DomainException {
  constructor() {
    super('Token has expired', 'TOKEN_EXPIRED');
  }
}

export class InvalidTokenException extends DomainException {
  constructor() {
    super('Invalid token', 'INVALID_TOKEN');
  }
}
