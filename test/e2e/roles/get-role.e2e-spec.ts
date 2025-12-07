import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { RoleFactory } from '../../support/factories/role.factory';

describe('GET /api/roles/:id', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let roleFactory: RoleFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    roleFactory = new RoleFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanUsersAndOrganizations();
  });

  describe('Happy Path', () => {
    it('should get role by id', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const role = await roleFactory.create({
        name: 'test-role',
        description: 'Test role description',
      });

      const response = await request(ctx.server)
        .get(`/api/roles/${role.id}`)
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body).toMatchObject({
        id: role.id,
        name: 'test-role',
        description: 'Test role description',
        isSystem: false,
      });
    });

    it('should get system role', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const adminRole = await roleFactory.getSystemRole('admin');

      const response = await request(ctx.server)
        .get(`/api/roles/${adminRole!.id}`)
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body).toMatchObject({
        id: adminRole!.id,
        name: 'admin',
        isSystem: true,
      });
    });

    it('should include permissions', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const permissions = await roleFactory.getAllPermissions();
      const role = await roleFactory.create({
        name: 'role-with-perms',
        permissionCodes: permissions.slice(0, 2).map((p) => p.code),
      });

      const response = await request(ctx.server)
        .get(`/api/roles/${role.id}`)
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body.permissionIds).toBeDefined();
      expect(response.body.permissionIds.length).toBe(2);
    });
  });

  describe('Not Found', () => {
    it('should return 404 for non-existent role', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .get('/api/roles/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(user))
        .expect(404);
    });
  });

  describe('Validation', () => {
    it('should return 400 for invalid UUID', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .get('/api/roles/not-a-uuid')
        .set(authHelper.authHeader(user))
        .expect(400);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      const role = await roleFactory.create();

      await request(ctx.server).get(`/api/roles/${role.id}`).expect(401);
    });
  });
});
