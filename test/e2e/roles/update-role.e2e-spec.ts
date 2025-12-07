import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { RoleFactory } from '../../support/factories/role.factory';

describe('PATCH /api/roles/:id', () => {
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
    it('should update role name', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const role = await roleFactory.create({ name: 'original-role' });

      const response = await request(ctx.server)
        .patch(`/api/roles/${role.id}`)
        .set(authHelper.authHeader(superAdmin))
        .send({
          name: 'updated-role',
        })
        .expect(200);

      expect(response.body.name).toBe('updated-role');
    });

    it('should update role description', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const role = await roleFactory.create();

      const response = await request(ctx.server)
        .patch(`/api/roles/${role.id}`)
        .set(authHelper.authHeader(superAdmin))
        .send({
          description: 'New description',
        })
        .expect(200);

      expect(response.body.description).toBe('New description');
    });

    it('should update role permissions', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const role = await roleFactory.create();
      const permissions = await roleFactory.getAllPermissions();

      const response = await request(ctx.server)
        .patch(`/api/roles/${role.id}`)
        .set(authHelper.authHeader(superAdmin))
        .send({
          permissionIds: permissions.slice(0, 3).map((p) => p.id),
        })
        .expect(200);

      expect(response.body.permissionIds.length).toBe(3);
    });

    it('should allow partial update', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const role = await roleFactory.create({
        name: 'original',
        description: 'Original desc',
      });

      const response = await request(ctx.server)
        .patch(`/api/roles/${role.id}`)
        .set(authHelper.authHeader(superAdmin))
        .send({
          name: 'updated',
        })
        .expect(200);

      expect(response.body.name).toBe('updated');
      expect(response.body.description).toBe('Original desc');
    });
  });

  describe('Protected System Roles', () => {
    it('should prevent updating system role name', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const systemRole = await roleFactory.getSystemRole('admin');

      await request(ctx.server)
        .patch(`/api/roles/${systemRole!.id}`)
        .set(authHelper.authHeader(superAdmin))
        .send({
          name: 'hacked-admin',
        })
        .expect(403);
    });
  });

  describe('Not Found', () => {
    it('should return 404 for non-existent role', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .patch('/api/roles/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(superAdmin))
        .send({
          name: 'updated',
        })
        .expect(404);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for name too long', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const role = await roleFactory.create();

      await request(ctx.server)
        .patch(`/api/roles/${role.id}`)
        .set(authHelper.authHeader(superAdmin))
        .send({
          name: 'A'.repeat(101),
        })
        .expect(400);
    });

    it('should return 400 for invalid permission UUID', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const role = await roleFactory.create();

      await request(ctx.server)
        .patch(`/api/roles/${role.id}`)
        .set(authHelper.authHeader(superAdmin))
        .send({
          permissionIds: ['not-a-uuid'],
        })
        .expect(400);
    });
  });

  describe('Forbidden', () => {
    it('should return 403 for member role', async () => {
      const member = await authHelper.createMember();
      const role = await roleFactory.create();

      await request(ctx.server)
        .patch(`/api/roles/${role.id}`)
        .set(authHelper.authHeader(member))
        .send({
          name: 'updated',
        })
        .expect(403);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      const role = await roleFactory.create();

      await request(ctx.server)
        .patch(`/api/roles/${role.id}`)
        .send({
          name: 'updated',
        })
        .expect(401);
    });
  });
});
