import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { OrganizationFactory } from '../../support/factories/organization.factory';
import { OrganizationOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/organization.orm-entity';

describe('DELETE /api/organizations/:id', () => {
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
    it('should allow super_admin to delete organization', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const org = await orgFactory.create({ ownerId: superAdmin.user.id });

      await request(ctx.server)
        .delete(`/api/organizations/${org.id}`)
        .set(authHelper.authHeader(superAdmin))
        .expect(204);

      // Verify deleted
      const orgRepo = ctx.db.getRepository(OrganizationOrmEntity);
      const deleted = await orgRepo.findOne({ where: { id: org.id } });
      expect(deleted).toBeNull();
    });
  });

  describe('Forbidden', () => {
    it('should return 403 for admin role', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const admin = await authHelper.createAdmin();
      const org = await orgFactory.create({ ownerId: superAdmin.user.id });

      await request(ctx.server)
        .delete(`/api/organizations/${org.id}`)
        .set(authHelper.authHeader(admin))
        .expect(403);
    });

    it('should return 403 for member role', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const member = await authHelper.createMember();
      const org = await orgFactory.create({ ownerId: superAdmin.user.id });

      await request(ctx.server)
        .delete(`/api/organizations/${org.id}`)
        .set(authHelper.authHeader(member))
        .expect(403);
    });
  });

  describe('Not Found', () => {
    it('should return 404 for non-existent organization', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .delete('/api/organizations/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(superAdmin))
        .expect(404);
    });
  });

  describe('Validation', () => {
    it('should return 400 for invalid UUID', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .delete('/api/organizations/not-a-uuid')
        .set(authHelper.authHeader(superAdmin))
        .expect(400);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      const user = await authHelper.createUser();
      const org = await orgFactory.create({ ownerId: user.id });

      await request(ctx.server)
        .delete(`/api/organizations/${org.id}`)
        .expect(401);
    });
  });
});
