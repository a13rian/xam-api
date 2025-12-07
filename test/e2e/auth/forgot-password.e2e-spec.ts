import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { UserFactory } from '../../support/factories/user.factory';

describe('POST /api/auth/forgot-password', () => {
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
