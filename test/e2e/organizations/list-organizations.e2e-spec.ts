import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { OrganizationFactory } from '../../support/factories/organization.factory';

describe('GET /api/organizations', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let orgFactory: OrganizationFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    orgFactory = new OrganizationFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanUsersAndOrganizations();
  });

  describe('Happy Path', () => {
    it('should allow super_admin to list all organizations', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await orgFactory.create({ ownerId: superAdmin.user.id });
      await orgFactory.create({ ownerId: superAdmin.user.id });

      const response = await request(ctx.server)
        .get('/api/organizations')
        .set(authHelper.authHeader(superAdmin))
        .expect(200);

      expect(response.body.items.length).toBe(2);
    });

    it('should return paginated results', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      for (let i = 0; i < 10; i++) {
        await orgFactory.create({ ownerId: superAdmin.user.id });
      }

      const response = await request(ctx.server)
        .get('/api/organizations')
        .set(authHelper.authHeader(superAdmin))
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.items.length).toBe(5);
      expect(response.body.total).toBe(10);
    });

    it('should filter by ownerId', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const otherUser = await authHelper.createUser();

      await orgFactory.create({ ownerId: superAdmin.user.id });
      await orgFactory.create({ ownerId: otherUser.id });

      const response = await request(ctx.server)
        .get('/api/organizations')
        .set(authHelper.authHeader(superAdmin))
        .query({ ownerId: superAdmin.user.id })
        .expect(200);

      expect(
        response.body.items.every(
          (o: { ownerId: string }) => o.ownerId === superAdmin.user.id,
        ),
      ).toBe(true);
    });
  });

  describe('Forbidden', () => {
    it('should return 403 for admin role', async () => {
      const admin = await authHelper.createAdmin();

      await request(ctx.server)
        .get('/api/organizations')
        .set(authHelper.authHeader(admin))
        .expect(403);
    });

    it('should return 403 for member role', async () => {
      const member = await authHelper.createMember();

      await request(ctx.server)
        .get('/api/organizations')
        .set(authHelper.authHeader(member))
        .expect(403);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server).get('/api/organizations').expect(401);
    });
  });
});
