import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { TestContext } from '../test-app';
import { UserFactory, CreatedUser } from '../factories/user.factory';
import { AuthenticatedUser } from '../../../src/shared/interfaces/authenticated-user.interface';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationId: string | null;
    roleIds: string[];
  };
}

export interface TestUser extends LoginResult {
  password: string;
}

export class AuthHelper {
  private userFactory: UserFactory;

  constructor(private readonly ctx: TestContext) {
    this.userFactory = new UserFactory(ctx.db);
  }

  /**
   * Create a user and login, returning tokens
   */
  async createAuthenticatedUser(
    options: Parameters<UserFactory['create']>[0] = {},
  ): Promise<TestUser> {
    const userData = await this.userFactory.create(options);

    const response = await request(this.ctx.server)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(200);

    return {
      ...response.body,
      password: userData.password,
    };
  }

  /**
   * Create a super_admin user and return tokens
   */
  async createSuperAdmin(): Promise<TestUser> {
    return this.createAuthenticatedUser({
      roleNames: ['super_admin'],
    });
  }

  /**
   * Create an admin user and return tokens
   */
  async createAdmin(organizationId?: string): Promise<TestUser> {
    return this.createAuthenticatedUser({
      roleNames: ['admin'],
      organizationId,
    });
  }

  /**
   * Create a member user and return tokens
   */
  async createMember(organizationId?: string): Promise<TestUser> {
    return this.createAuthenticatedUser({
      roleNames: ['member'],
      organizationId,
    });
  }

  /**
   * Create a user without logging in (for testing login scenarios)
   */
  async createUser(
    options: Parameters<UserFactory['create']>[0] = {},
  ): Promise<CreatedUser> {
    return this.userFactory.create(options);
  }

  /**
   * Create an unverified user
   */
  async createUnverifiedUser(
    options: Parameters<UserFactory['create']>[0] = {},
  ): Promise<CreatedUser> {
    return this.userFactory.createUnverified(options);
  }

  /**
   * Create a locked user
   */
  async createLockedUser(
    lockedUntil: Date,
    options: Parameters<UserFactory['create']>[0] = {},
  ): Promise<CreatedUser> {
    return this.userFactory.createLocked(lockedUntil, options);
  }

  /**
   * Create an inactive user
   */
  async createInactiveUser(
    options: Parameters<UserFactory['create']>[0] = {},
  ): Promise<CreatedUser> {
    return this.userFactory.createInactive(options);
  }

  /**
   * Get authorization header for a user
   */
  authHeader(user: TestUser | { accessToken: string }): {
    Authorization: string;
  } {
    return {
      Authorization: `Bearer ${user.accessToken}`,
    };
  }

  /**
   * Create an expired token for testing
   */
  createExpiredToken(user: AuthenticatedUser): string {
    const jwtService = this.ctx.module.get(JwtService);
    return jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        organizationId: user.organizationId,
        roleIds: user.roleIds,
      },
      { expiresIn: '-1h' }, // Expired 1 hour ago
    );
  }

  /**
   * Create a token with invalid signature
   */
  createInvalidToken(): string {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIn0.invalid_signature';
  }

  /**
   * Create a malformed token
   */
  createMalformedToken(): string {
    return 'not.a.valid.jwt.token';
  }
}
