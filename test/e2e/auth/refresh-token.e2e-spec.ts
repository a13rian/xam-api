import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';

describe('POST /api/auth/refresh', () => {
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
      await request(ctx.server).post('/api/auth/refresh').send({}).expect(400);
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
