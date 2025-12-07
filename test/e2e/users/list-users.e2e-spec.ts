import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { UserFactory } from '../../support/factories/user.factory';
import { OrganizationFactory } from '../../support/factories/organization.factory';

describe('GET /api/users', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let userFactory: UserFactory;
  let orgFactory: OrganizationFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    userFactory = new UserFactory(ctx.db);
    orgFactory = new OrganizationFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanUsersAndOrganizations();
  });

  describe('Happy Path', () => {
    it('should return paginated list of users', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      // Create additional users
      for (let i = 0; i < 5; i++) {
        await userFactory.create();
      }

      const response = await request(ctx.server)
        .get('/api/users')
        .set(authHelper.authHeader(superAdmin))
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBeGreaterThanOrEqual(5);
      expect(response.body).toMatchObject({
        total: expect.any(Number),
        page: 1,
        limit: 10,
      });
    });

    it('should filter users by organizationId', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const org = await orgFactory.create({ ownerId: superAdmin.user.id });

      await userFactory.create({ organizationId: org.id });
      await userFactory.create({ organizationId: org.id });
      await userFactory.create(); // No org

      const response = await request(ctx.server)
        .get('/api/users')
        .set(authHelper.authHeader(superAdmin))
        .query({ organizationId: org.id })
        .expect(200);

      expect(
        response.body.items.every(
          (u: { organizationId: string }) => u.organizationId === org.id,
        ),
      ).toBe(true);
    });

    it('should respect pagination limits', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      for (let i = 0; i < 15; i++) {
        await userFactory.create();
      }

      const response = await request(ctx.server)
        .get('/api/users')
        .set(authHelper.authHeader(superAdmin))
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.items.length).toBe(5);
    });

    it('should return correct page', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      for (let i = 0; i < 10; i++) {
        await userFactory.create();
      }

      const response = await request(ctx.server)
        .get('/api/users')
        .set(authHelper.authHeader(superAdmin))
        .query({ page: 2, limit: 5 })
        .expect(200);

      expect(response.body.page).toBe(2);
    });
  });

  describe('Forbidden', () => {
    it('should return 403 for member role', async () => {
      const member = await authHelper.createMember();

      await request(ctx.server)
        .get('/api/users')
        .set(authHelper.authHeader(member))
        .expect(403);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server).get('/api/users').expect(401);
    });
  });

  describe('Validation', () => {
    it('should return 400 for invalid page number', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .get('/api/users')
        .set(authHelper.authHeader(superAdmin))
        .query({ page: 0 })
        .expect(400);
    });

    it('should return 400 for negative page', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .get('/api/users')
        .set(authHelper.authHeader(superAdmin))
        .query({ page: -1 })
        .expect(400);
    });
  });
});
