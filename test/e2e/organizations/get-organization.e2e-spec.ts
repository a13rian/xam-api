import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { OrganizationFactory } from '../../support/factories/organization.factory';

describe('GET /api/organizations/:id', () => {
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
    it('should get organization by id', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const org = await orgFactory.create({
        name: 'Test Org',
        slug: 'test-org',
        ownerId: user.user.id,
      });

      const response = await request(ctx.server)
        .get(`/api/organizations/${org.id}`)
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body).toMatchObject({
        id: org.id,
        name: 'Test Org',
        slug: 'test-org',
        ownerId: user.user.id,
      });
    });

    it('should include all organization fields', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const org = await orgFactory.create({
        name: 'Full Org',
        slug: 'full-org',
        description: 'Full description',
        ownerId: user.user.id,
      });

      const response = await request(ctx.server)
        .get(`/api/organizations/${org.id}`)
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body).toMatchObject({
        id: org.id,
        name: 'Full Org',
        slug: 'full-org',
        description: 'Full description',
        isActive: true,
      });
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });
  });

  describe('Not Found', () => {
    it('should return 404 for non-existent organization', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .get('/api/organizations/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(user))
        .expect(404);
    });
  });

  describe('Validation', () => {
    it('should return 400 for invalid UUID', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .get('/api/organizations/not-a-uuid')
        .set(authHelper.authHeader(user))
        .expect(400);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      const user = await authHelper.createUser();
      const org = await orgFactory.create({ ownerId: user.id });

      await request(ctx.server).get(`/api/organizations/${org.id}`).expect(401);
    });
  });
});
