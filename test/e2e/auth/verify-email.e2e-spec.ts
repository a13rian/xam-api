import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { UserFactory } from '../../support/factories/user.factory';
import { EmailVerificationTokenOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/email-verification-token.orm-entity';

describe('POST /api/auth/verify-email', () => {
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
      const token = await createEmailVerificationToken(user.id, { used: true });

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
