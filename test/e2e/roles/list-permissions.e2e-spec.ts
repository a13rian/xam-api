import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';

describe('GET /api/roles/permissions', () => {
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
    it('should list all permissions', async () => {
      const user = await authHelper.createAuthenticatedUser();

      const response = await request(ctx.server)
        .get('/api/roles/permissions')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0]).toMatchObject({
        id: expect.any(String),
        code: expect.any(String),
        name: expect.any(String),
        resource: expect.any(String),
        action: expect.any(String),
      });
    });

    it('should filter permissions by resource', async () => {
      const user = await authHelper.createAuthenticatedUser();

      const response = await request(ctx.server)
        .get('/api/roles/permissions')
        .set(authHelper.authHeader(user))
        .query({ resource: 'user' })
        .expect(200);

      expect(
        response.body.items.every(
          (p: { resource: string }) => p.resource === 'user',
        ),
      ).toBe(true);
    });

    it('should include all permission fields', async () => {
      const user = await authHelper.createAuthenticatedUser();

      const response = await request(ctx.server)
        .get('/api/roles/permissions')
        .set(authHelper.authHeader(user))
        .expect(200);

      const permission = response.body.items[0];
      expect(permission.id).toBeDefined();
      expect(permission.code).toBeDefined();
      expect(permission.name).toBeDefined();
      expect(permission.resource).toBeDefined();
      expect(permission.action).toBeDefined();
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server).get('/api/roles/permissions').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(ctx.server)
        .get('/api/roles/permissions')
        .set('Authorization', `Bearer ${authHelper.createInvalidToken()}`)
        .expect(401);
    });
  });
});
