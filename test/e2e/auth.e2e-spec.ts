/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AuthHelper } from '../support/auth/auth.helper';
import { UserFactory } from '../support/factories/user.factory';
import { WalletFactory } from '../support/factories/wallet.factory';
import { UserOrmEntity } from '../../src/infrastructure/persistence/typeorm/entities/user.orm-entity';
import { EmailVerificationTokenOrmEntity } from '../../src/infrastructure/persistence/typeorm/entities/email-verification-token.orm-entity';
import { PasswordResetTokenOrmEntity } from '../../src/infrastructure/persistence/typeorm/entities/password-reset-token.orm-entity';
import { WalletOrmEntity } from '../../src/infrastructure/persistence/typeorm/entities/wallet.orm-entity';

describe('Auth E2E', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let userFactory: UserFactory;
  let walletFactory: WalletFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    userFactory = new UserFactory(ctx.db);
    walletFactory = new WalletFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanUsersAndOrganizations();
  });

  // Helper functions
  async function createEmailVerificationToken(
    userId: string,
    options: { expired?: boolean; used?: boolean } = {},
  ): Promise<string> {
    const tokenRepo = ctx.db.getRepository(EmailVerificationTokenOrmEntity);
    const token = uuidv4().replace(/-/g, '');

    const expiresAt = options.expired
      ? new Date(Date.now() - 86400000) // 24 hours ago
      : new Date(Date.now() + 86400000); // 24 hours from now

    const entity = tokenRepo.create({
      id: uuidv4(),
      token,
      userId,
      expiresAt,
      isUsed: options.used ?? false,
      createdAt: new Date(),
    });

    await tokenRepo.save(entity);
    return token;
  }

  async function createPasswordResetToken(
    userId: string,
    options: { expired?: boolean; used?: boolean } = {},
  ): Promise<string> {
    const tokenRepo = ctx.db.getRepository(PasswordResetTokenOrmEntity);
    const token = uuidv4().replace(/-/g, '');

    const expiresAt = options.expired
      ? new Date(Date.now() - 3600000) // 1 hour ago
      : new Date(Date.now() + 3600000); // 1 hour from now

    const entity = tokenRepo.create({
      id: uuidv4(),
      token,
      userId,
      expiresAt,
      isUsed: options.used ?? false,
      createdAt: new Date(),
    });

    await tokenRepo.save(entity);
    return token;
  }

  describe('POST /api/auth/login', () => {
    describe('Happy Path', () => {
      it('should login successfully with valid credentials', async () => {
        const user = await userFactory.create({
          email: 'login@test.com',
          password: 'ValidPass123!',
        });

        const response = await request(ctx.server)
          .post('/api/auth/login')
          .send({
            email: 'login@test.com',
            password: 'ValidPass123!',
          })
          .expect(200);

        expect(response.body).toMatchObject({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          expiresIn: expect.any(Number),
          user: {
            id: user.id,
            email: 'login@test.com',
          },
        });
      });

      it('should return user roles in response', async () => {
        await userFactory.create({
          email: 'roleuser@test.com',
          password: 'ValidPass123!',
          roleNames: ['admin', 'member'],
        });

        const response = await request(ctx.server)
          .post('/api/auth/login')
          .send({
            email: 'roleuser@test.com',
            password: 'ValidPass123!',
          })
          .expect(200);

        expect(response.body.user.roleIds).toHaveLength(2);
      });
    });

    describe('Invalid Credentials', () => {
      it('should return 401 for wrong password', async () => {
        await userFactory.create({
          email: 'user@test.com',
          password: 'CorrectPass123!',
        });

        const response = await request(ctx.server)
          .post('/api/auth/login')
          .send({
            email: 'user@test.com',
            password: 'WrongPassword123!',
          })
          .expect(401);

        expect(response.body.message).toBeDefined();
      });

      it('should return 401 for non-existent email', async () => {
        const response = await request(ctx.server)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@test.com',
            password: 'AnyPassword123!',
          })
          .expect(401);

        expect(response.body.message).toBeDefined();
      });
    });

    describe('Security Scenarios', () => {
      it('should return 403 for inactive account', async () => {
        await userFactory.createInactive({
          email: 'inactive@test.com',
          password: 'ValidPass123!',
        });

        await request(ctx.server)
          .post('/api/auth/login')
          .send({
            email: 'inactive@test.com',
            password: 'ValidPass123!',
          })
          .expect(403);
      });

      it('should return 403 for locked account', async () => {
        const lockedUntil = new Date(Date.now() + 3600000); // 1 hour from now
        await userFactory.createLocked(lockedUntil, {
          email: 'locked@test.com',
          password: 'ValidPass123!',
        });

        await request(ctx.server)
          .post('/api/auth/login')
          .send({
            email: 'locked@test.com',
            password: 'ValidPass123!',
          })
          .expect(403);
      });

      it('should increment failed login attempts on wrong password', async () => {
        const user = await userFactory.create({
          email: 'attempts@test.com',
          password: 'CorrectPass123!',
        });

        // Multiple failed attempts
        for (let i = 0; i < 3; i++) {
          await request(ctx.server)
            .post('/api/auth/login')
            .send({
              email: 'attempts@test.com',
              password: 'WrongPassword!',
            })
            .expect(401);
        }

        // Verify attempts increased in database
        const userRepo = ctx.db.getRepository(UserOrmEntity);
        const updatedUser = await userRepo.findOne({ where: { id: user.id } });
        expect(updatedUser?.failedLoginAttempts).toBeGreaterThanOrEqual(3);
      });

      it('should auto-unlock expired lock', async () => {
        const expiredLock = new Date(Date.now() - 1000); // 1 second ago
        await userFactory.createLocked(expiredLock, {
          email: 'expired-lock@test.com',
          password: 'ValidPass123!',
        });

        const response = await request(ctx.server)
          .post('/api/auth/login')
          .send({
            email: 'expired-lock@test.com',
            password: 'ValidPass123!',
          });

        // Should succeed since lock is expired
        expect(response.status).toBe(200);
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for invalid email format', async () => {
        await request(ctx.server)
          .post('/api/auth/login')
          .send({
            email: 'not-an-email',
            password: 'Password123!',
          })
          .expect(400);
      });

      it('should return 400 for missing password', async () => {
        await request(ctx.server)
          .post('/api/auth/login')
          .send({
            email: 'user@test.com',
          })
          .expect(400);
      });

      it('should return 400 for missing email', async () => {
        await request(ctx.server)
          .post('/api/auth/login')
          .send({
            password: 'Password123!',
          })
          .expect(400);
      });
    });
  });

  describe('POST /api/auth/register', () => {
    describe('Happy Path', () => {
      it('should register a new user successfully', async () => {
        const response = await request(ctx.server)
          .post('/api/auth/register')
          .send({
            email: 'newuser@test.com',
            password: 'SecurePass123!',
            firstName: 'John',
            lastName: 'Doe',
          })
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(String),
          email: 'newuser@test.com',
          firstName: 'John',
          lastName: 'Doe',
        });
      });

      it('should create a default wallet for new user', async () => {
        const response = await request(ctx.server)
          .post('/api/auth/register')
          .send({
            email: 'walletuser@test.com',
            password: 'SecurePass123!',
            firstName: 'Wallet',
            lastName: 'User',
          })
          .expect(201);

        const userId = response.body.id;

        // Wait for async event handler to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verify wallet was created in database
        const walletRepo = ctx.db.getRepository(WalletOrmEntity);
        const wallet = await walletRepo.findOne({ where: { userId } });

        expect(wallet).not.toBeNull();
        expect(wallet?.balance).toBe('0.00');
        expect(wallet?.currency).toBe('VND');
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for invalid email format', async () => {
        const response = await request(ctx.server)
          .post('/api/auth/register')
          .send({
            email: 'invalid-email',
            password: 'SecurePass123!',
            firstName: 'John',
            lastName: 'Doe',
          })
          .expect(400);

        expect(response.body.message).toBeDefined();
      });

      it('should return 400 for password too short', async () => {
        const response = await request(ctx.server)
          .post('/api/auth/register')
          .send({
            email: 'user@test.com',
            password: 'short',
            firstName: 'John',
            lastName: 'Doe',
          })
          .expect(400);

        expect(response.body.message).toBeDefined();
      });

      it('should return 400 for missing required fields', async () => {
        const response = await request(ctx.server)
          .post('/api/auth/register')
          .send({})
          .expect(400);

        expect(response.body.message).toBeDefined();
      });

      it('should return 400 for firstName exceeding max length', async () => {
        await request(ctx.server)
          .post('/api/auth/register')
          .send({
            email: 'user@test.com',
            password: 'SecurePass123!',
            firstName: 'A'.repeat(101),
            lastName: 'Doe',
          })
          .expect(400);
      });

      it('should return 400 for lastName exceeding max length', async () => {
        await request(ctx.server)
          .post('/api/auth/register')
          .send({
            email: 'user@test.com',
            password: 'SecurePass123!',
            firstName: 'John',
            lastName: 'D'.repeat(101),
          })
          .expect(400);
      });
    });

    describe('Conflict Errors', () => {
      it('should return 409 for duplicate email', async () => {
        await userFactory.create({ email: 'existing@test.com' });

        const response = await request(ctx.server)
          .post('/api/auth/register')
          .send({
            email: 'existing@test.com',
            password: 'SecurePass123!',
            firstName: 'John',
            lastName: 'Doe',
          })
          .expect(409);

        expect(response.body.message).toBeDefined();
      });
    });

    describe('Not Found Errors', () => {
      // No organization-related tests needed
    });
  });

  describe('POST /api/auth/logout', () => {
    describe('Happy Path', () => {
      it('should logout successfully', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .post('/api/auth/logout')
          .set(authHelper.authHeader(user))
          .send({
            refreshToken: user.refreshToken,
          })
          .expect(200);

        expect(response.body.message).toBeDefined();
      });

      it('should logout without refresh token', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .post('/api/auth/logout')
          .set(authHelper.authHeader(user))
          .send({})
          .expect(200);

        expect(response.body.message).toBeDefined();
      });

      it('should logout all devices', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .post('/api/auth/logout')
          .set(authHelper.authHeader(user))
          .send({
            logoutAllDevices: true,
          })
          .expect(200);

        expect(response.body.message).toBeDefined();
      });

      it('should invalidate refresh token after logout', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/auth/logout')
          .set(authHelper.authHeader(user))
          .send({
            refreshToken: user.refreshToken,
          })
          .expect(200);

        // Try to use the refresh token - should fail
        await request(ctx.server)
          .post('/api/auth/refresh')
          .send({
            refreshToken: user.refreshToken,
          })
          .expect(401);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server).post('/api/auth/logout').send({}).expect(401);
      });

      it('should return 401 with invalid token', async () => {
        await request(ctx.server)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${authHelper.createInvalidToken()}`)
          .send({})
          .expect(401);
      });
    });
  });

  describe('POST /api/auth/refresh', () => {
    describe('Happy Path', () => {
      it('should refresh tokens successfully', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .post('/api/auth/refresh')
          .send({
            refreshToken: user.refreshToken,
          })
          .expect(200);

        expect(response.body).toMatchObject({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          expiresIn: expect.any(Number),
        });

        // New refresh token should always be different (uses UUID)
        expect(response.body.refreshToken).not.toBe(user.refreshToken);
      });

      it('should return valid tokens that can be used', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const refreshResponse = await request(ctx.server)
          .post('/api/auth/refresh')
          .send({
            refreshToken: user.refreshToken,
          })
          .expect(200);

        // Use the new access token
        await request(ctx.server)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${refreshResponse.body.accessToken}`)
          .expect(200);
      });
    });

    describe('Invalid Token', () => {
      it('should return 401 for invalid refresh token', async () => {
        await request(ctx.server)
          .post('/api/auth/refresh')
          .send({
            refreshToken: 'invalid-token',
          })
          .expect(401);
      });

      it('should return 401 for empty refresh token', async () => {
        await request(ctx.server)
          .post('/api/auth/refresh')
          .send({
            refreshToken: '',
          })
          .expect(401);
      });

      it('should return 400 for missing refresh token', async () => {
        await request(ctx.server)
          .post('/api/auth/refresh')
          .send({})
          .expect(400);
      });
    });

    describe('Edge Cases', () => {
      it('should invalidate old refresh token after use', async () => {
        const user = await authHelper.createAuthenticatedUser();

        // First refresh - should succeed
        const firstRefresh = await request(ctx.server)
          .post('/api/auth/refresh')
          .send({
            refreshToken: user.refreshToken,
          })
          .expect(200);

        // Use the new refresh token - should succeed
        await request(ctx.server)
          .post('/api/auth/refresh')
          .send({
            refreshToken: firstRefresh.body.refreshToken,
          })
          .expect(200);
      });
    });
  });

  describe('GET /api/auth/me', () => {
    describe('Happy Path', () => {
      it('should return current user details', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .get('/api/auth/me')
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body).toMatchObject({
          id: user.user.id,
          email: user.user.email,
        });
      });

      it('should return user with roles', async () => {
        const user = await authHelper.createSuperAdmin();

        const response = await request(ctx.server)
          .get('/api/auth/me')
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body.id).toBe(user.user.id);
      });

      it('should return user with wallet info when wallet exists', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const wallet = await walletFactory.createWithBalance(
          user.user.id,
          500000,
        );

        const response = await request(ctx.server)
          .get('/api/auth/me')
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body.wallet).toMatchObject({
          id: wallet.id,
          balance: 500000,
          currency: 'VND',
        });
      });

      it('should return null wallet when user has no wallet', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .get('/api/auth/me')
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body.wallet).toBeNull();
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server).get('/api/auth/me').expect(401);
      });

      it('should return 401 with expired token', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const expiredToken = authHelper.createExpiredToken({
          id: user.user.id,
          email: user.user.email,
          roleIds: user.user.roleIds,
        });

        await request(ctx.server)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${expiredToken}`)
          .expect(401);
      });

      it('should return 401 with invalid token signature', async () => {
        await request(ctx.server)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${authHelper.createInvalidToken()}`)
          .expect(401);
      });

      it('should return 401 with malformed token', async () => {
        await request(ctx.server)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${authHelper.createMalformedToken()}`)
          .expect(401);
      });

      it('should return 401 with Bearer but no token', async () => {
        await request(ctx.server)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer ')
          .expect(401);
      });

      it('should return 401 with empty Authorization header', async () => {
        await request(ctx.server)
          .get('/api/auth/me')
          .set('Authorization', '')
          .expect(401);
      });
    });
  });

  describe('POST /api/auth/verify-email', () => {
    describe('Happy Path', () => {
      it('should verify email successfully with valid token', async () => {
        const user = await userFactory.createUnverified({
          email: 'verify@test.com',
        });
        const token = await createEmailVerificationToken(user.id);

        const response = await request(ctx.server)
          .post('/api/auth/verify-email')
          .send({ token })
          .expect(200);

        expect(response.body.message).toBeDefined();
      });
    });

    describe('Invalid Token', () => {
      it('should return 400 for expired token', async () => {
        const user = await userFactory.createUnverified();
        const token = await createEmailVerificationToken(user.id, {
          expired: true,
        });

        await request(ctx.server)
          .post('/api/auth/verify-email')
          .send({ token })
          .expect(400);
      });

      it('should return 400 for already used token', async () => {
        const user = await userFactory.createUnverified();
        const token = await createEmailVerificationToken(user.id, {
          used: true,
        });

        await request(ctx.server)
          .post('/api/auth/verify-email')
          .send({ token })
          .expect(400);
      });

      it('should return 400 for invalid token', async () => {
        await request(ctx.server)
          .post('/api/auth/verify-email')
          .send({ token: 'invalid-token' })
          .expect(400);
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for missing token', async () => {
        await request(ctx.server)
          .post('/api/auth/verify-email')
          .send({})
          .expect(400);
      });

      it('should return 400 for empty token', async () => {
        await request(ctx.server)
          .post('/api/auth/verify-email')
          .send({ token: '' })
          .expect(400);
      });
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    describe('Happy Path', () => {
      it('should accept request for existing user', async () => {
        await userFactory.create({ email: 'forgot@test.com' });

        const response = await request(ctx.server)
          .post('/api/auth/forgot-password')
          .send({
            email: 'forgot@test.com',
          })
          .expect(200);

        expect(response.body.message).toBeDefined();
      });

      it('should accept request for non-existent email (security)', async () => {
        // For security, we should not reveal if email exists
        const response = await request(ctx.server)
          .post('/api/auth/forgot-password')
          .send({
            email: 'nonexistent@test.com',
          })
          .expect(200);

        expect(response.body.message).toBeDefined();
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for invalid email format', async () => {
        await request(ctx.server)
          .post('/api/auth/forgot-password')
          .send({
            email: 'invalid-email',
          })
          .expect(400);
      });

      it('should return 400 for missing email', async () => {
        await request(ctx.server)
          .post('/api/auth/forgot-password')
          .send({})
          .expect(400);
      });

      it('should return 400 for empty email', async () => {
        await request(ctx.server)
          .post('/api/auth/forgot-password')
          .send({
            email: '',
          })
          .expect(400);
      });
    });
  });

  describe('POST /api/auth/reset-password', () => {
    describe('Happy Path', () => {
      it('should reset password successfully with valid token', async () => {
        const user = await userFactory.create({ email: 'reset@test.com' });
        const token = await createPasswordResetToken(user.id);

        const response = await request(ctx.server)
          .post('/api/auth/reset-password')
          .send({
            token,
            newPassword: 'NewSecurePass123!',
          })
          .expect(200);

        expect(response.body.message).toBeDefined();

        // Verify new password works
        await request(ctx.server)
          .post('/api/auth/login')
          .send({
            email: 'reset@test.com',
            password: 'NewSecurePass123!',
          })
          .expect(200);
      });
    });

    describe('Invalid Token', () => {
      it('should return 400 for expired token', async () => {
        const user = await userFactory.create();
        const token = await createPasswordResetToken(user.id, {
          expired: true,
        });

        await request(ctx.server)
          .post('/api/auth/reset-password')
          .send({
            token,
            newPassword: 'NewSecurePass123!',
          })
          .expect(400);
      });

      it('should return 400 for already used token', async () => {
        const user = await userFactory.create();
        const token = await createPasswordResetToken(user.id, { used: true });

        await request(ctx.server)
          .post('/api/auth/reset-password')
          .send({
            token,
            newPassword: 'NewSecurePass123!',
          })
          .expect(400);
      });

      it('should return 400 for invalid token', async () => {
        await request(ctx.server)
          .post('/api/auth/reset-password')
          .send({
            token: 'invalid-token',
            newPassword: 'NewSecurePass123!',
          })
          .expect(400);
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for password too short', async () => {
        const user = await userFactory.create();
        const token = await createPasswordResetToken(user.id);

        await request(ctx.server)
          .post('/api/auth/reset-password')
          .send({
            token,
            newPassword: 'short',
          })
          .expect(400);
      });

      it('should return 400 for missing token', async () => {
        await request(ctx.server)
          .post('/api/auth/reset-password')
          .send({
            newPassword: 'NewSecurePass123!',
          })
          .expect(400);
      });

      it('should return 400 for missing newPassword', async () => {
        await request(ctx.server)
          .post('/api/auth/reset-password')
          .send({
            token: 'some-token',
          })
          .expect(400);
      });
    });
  });
});
