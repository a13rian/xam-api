import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';

describe('POST /api/auth/logout', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanUsersAndOrganizations();
  });

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
