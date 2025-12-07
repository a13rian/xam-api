import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { UserFactory } from '../../support/factories/user.factory';
import { UserOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/user.orm-entity';

describe('POST /api/auth/login', () => {
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

      const response = await request(ctx.server).post('/api/auth/login').send({
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
