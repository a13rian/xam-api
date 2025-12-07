import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { RoleFactory } from '../../support/factories/role.factory';
import { RoleOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/role.orm-entity';

describe('DELETE /api/roles/:id', () => {
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
    it('should allow super_admin to delete custom role', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const role = await roleFactory.create({ name: 'deletable-role' });

      await request(ctx.server)
        .delete(`/api/roles/${role.id}`)
        .set(authHelper.authHeader(superAdmin))
        .expect(204);

      // Verify deleted
      const roleRepo = ctx.db.getRepository(RoleOrmEntity);
      const deleted = await roleRepo.findOne({ where: { id: role.id } });
      expect(deleted).toBeNull();
    });

    it('should allow admin to delete custom role', async () => {
      const admin = await authHelper.createAdmin();
      const role = await roleFactory.create({ name: 'admin-deletable' });

      await request(ctx.server)
        .delete(`/api/roles/${role.id}`)
        .set(authHelper.authHeader(admin))
        .expect(204);
    });
  });

  describe('Protected System Roles', () => {
    it('should prevent deletion of system roles', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const systemRole = await roleFactory.getSystemRole('admin');

      await request(ctx.server)
        .delete(`/api/roles/${systemRole!.id}`)
        .set(authHelper.authHeader(superAdmin))
        .expect(403);
    });

    it('should prevent deletion of super_admin role', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const superAdminRole = await roleFactory.getSystemRole('super_admin');

      await request(ctx.server)
        .delete(`/api/roles/${superAdminRole!.id}`)
        .set(authHelper.authHeader(superAdmin))
        .expect(403);
    });
  });

  describe('Not Found', () => {
    it('should return 404 for non-existent role', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .delete('/api/roles/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(superAdmin))
        .expect(404);
    });
  });

  describe('Validation', () => {
    it('should return 400 for invalid UUID', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .delete('/api/roles/not-a-uuid')
        .set(authHelper.authHeader(superAdmin))
        .expect(400);
    });
  });

  describe('Forbidden', () => {
    it('should return 403 for member role', async () => {
      const member = await authHelper.createMember();
      const role = await roleFactory.create();

      await request(ctx.server)
        .delete(`/api/roles/${role.id}`)
        .set(authHelper.authHeader(member))
        .expect(403);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      const role = await roleFactory.create();

      await request(ctx.server).delete(`/api/roles/${role.id}`).expect(401);
    });
  });
});
