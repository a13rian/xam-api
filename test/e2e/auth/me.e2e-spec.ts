import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';

describe('GET /api/auth/me', () => {
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
        organizationId: user.user.organizationId,
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
