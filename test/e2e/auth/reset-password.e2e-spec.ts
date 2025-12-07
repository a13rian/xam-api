import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { UserFactory } from '../../support/factories/user.factory';
import { PasswordResetTokenOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/password-reset-token.orm-entity';

describe('POST /api/auth/reset-password', () => {
  let ctx: TestContext;
  let userFactory: UserFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    userFactory = new UserFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanUsersAndOrganizations();
  });

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
      const token = await createPasswordResetToken(user.id, { expired: true });

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
