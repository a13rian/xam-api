import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { UserFactory } from '../../support/factories/user.factory';

describe('GET /api/users/:id', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let userFactory: UserFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    userFactory = new UserFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanUsersAndOrganizations();
  });

  describe('Happy Path', () => {
    it('should get user by id', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const user = await userFactory.create({
        email: 'target@test.com',
        firstName: 'Target',
        lastName: 'User',
      });

      const response = await request(ctx.server)
        .get(`/api/users/${user.id}`)
        .set(authHelper.authHeader(superAdmin))
        .expect(200);

      expect(response.body).toMatchObject({
        id: user.id,
        email: 'target@test.com',
        firstName: 'Target',
        lastName: 'User',
      });
    });

    it('should include user roles', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const user = await userFactory.create({
        roleNames: ['member'],
      });

      const response = await request(ctx.server)
        .get(`/api/users/${user.id}`)
        .set(authHelper.authHeader(superAdmin))
        .expect(200);

      expect(response.body.roleIds).toBeDefined();
      expect(response.body.roleIds.length).toBeGreaterThan(0);
    });
  });

  describe('Not Found', () => {
    it('should return 404 for non-existent user', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .get('/api/users/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(superAdmin))
        .expect(404);
    });
  });

  describe('Validation', () => {
    it('should return 400 for invalid UUID', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .get('/api/users/not-a-uuid')
        .set(authHelper.authHeader(superAdmin))
        .expect(400);
    });
  });

  describe('Forbidden', () => {
    it('should return 403 for member role', async () => {
      const member = await authHelper.createMember();
      const user = await userFactory.create();

      await request(ctx.server)
        .get(`/api/users/${user.id}`)
        .set(authHelper.authHeader(member))
        .expect(403);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      const user = await userFactory.create();

      await request(ctx.server).get(`/api/users/${user.id}`).expect(401);
    });
  });
});
