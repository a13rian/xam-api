import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { RoleFactory } from '../../support/factories/role.factory';
import { OrganizationFactory } from '../../support/factories/organization.factory';

describe('POST /api/roles', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let roleFactory: RoleFactory;
  let orgFactory: OrganizationFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    roleFactory = new RoleFactory(ctx.db);
    orgFactory = new OrganizationFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanUsersAndOrganizations();
  });

  describe('Happy Path', () => {
    it('should allow super_admin to create role', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const permissions = await roleFactory.getAllPermissions();

      const response = await request(ctx.server)
        .post('/api/roles')
        .set(authHelper.authHeader(superAdmin))
        .send({
          name: 'custom-role',
          description: 'A custom role',
          permissionIds: permissions.slice(0, 2).map((p) => p.id),
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'custom-role',
        description: 'A custom role',
        isSystem: false,
      });
    });

    it('should allow admin to create role', async () => {
      const admin = await authHelper.createAdmin();
      const permissions = await roleFactory.getAllPermissions();

      const response = await request(ctx.server)
        .post('/api/roles')
        .set(authHelper.authHeader(admin))
        .send({
          name: 'admin-role',
          description: 'Role created by admin',
          permissionIds: permissions.slice(0, 1).map((p) => p.id),
        })
        .expect(201);

      expect(response.body.name).toBe('admin-role');
    });

    it('should create organization-scoped role', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const org = await orgFactory.create({ ownerId: superAdmin.user.id });

      const response = await request(ctx.server)
        .post('/api/roles')
        .set(authHelper.authHeader(superAdmin))
        .send({
          name: 'org-role',
          description: 'Organization role',
          permissionIds: [],
          organizationId: org.id,
        })
        .expect(201);

      expect(response.body.organizationId).toBe(org.id);
    });

    it('should create role without permissions', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      const response = await request(ctx.server)
        .post('/api/roles')
        .set(authHelper.authHeader(superAdmin))
        .send({
          name: 'empty-role',
          description: 'Role without permissions',
          permissionIds: [],
        })
        .expect(201);

      expect(response.body.permissionIds).toHaveLength(0);
    });
  });

  describe('Forbidden', () => {
    it('should return 403 for member role', async () => {
      const member = await authHelper.createMember();

      await request(ctx.server)
        .post('/api/roles')
        .set(authHelper.authHeader(member))
        .send({
          name: 'forbidden-role',
          description: 'Should not be created',
          permissionIds: [],
        })
        .expect(403);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid permission UUID', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .post('/api/roles')
        .set(authHelper.authHeader(superAdmin))
        .send({
          name: 'invalid-role',
          description: 'Role with invalid permissions',
          permissionIds: ['not-a-uuid'],
        })
        .expect(400);
    });

    it('should return 400 for empty name', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .post('/api/roles')
        .set(authHelper.authHeader(superAdmin))
        .send({
          name: '',
          description: 'Empty name role',
          permissionIds: [],
        })
        .expect(400);
    });

    it('should return 400 for missing name', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .post('/api/roles')
        .set(authHelper.authHeader(superAdmin))
        .send({
          description: 'No name role',
          permissionIds: [],
        })
        .expect(400);
    });

    it('should return 400 for name too long', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .post('/api/roles')
        .set(authHelper.authHeader(superAdmin))
        .send({
          name: 'A'.repeat(101),
          description: 'Long name role',
          permissionIds: [],
        })
        .expect(400);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server)
        .post('/api/roles')
        .send({
          name: 'test-role',
          description: 'Test',
          permissionIds: [],
        })
        .expect(401);
    });
  });
});
