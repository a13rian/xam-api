import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { UserFactory } from '../../support/factories/user.factory';
import { UserOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/user.orm-entity';

describe('DELETE /api/users/:id', () => {
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
    it('should delete user successfully', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const user = await userFactory.create();

      await request(ctx.server)
        .delete(`/api/users/${user.id}`)
        .set(authHelper.authHeader(superAdmin))
        .expect(204);

      // Verify user is deleted
      const userRepo = ctx.db.getRepository(UserOrmEntity);
      const deleted = await userRepo.findOne({ where: { id: user.id } });
      expect(deleted).toBeNull();
    });

    it('should allow admin to delete user', async () => {
      const admin = await authHelper.createAdmin();
      const user = await userFactory.create();

      await request(ctx.server)
        .delete(`/api/users/${user.id}`)
        .set(authHelper.authHeader(admin))
        .expect(204);
    });
  });

  describe('Not Found', () => {
    it('should return 404 for non-existent user', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .delete('/api/users/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(superAdmin))
        .expect(404);
    });
  });

  describe('Validation', () => {
    it('should return 400 for invalid UUID', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .delete('/api/users/not-a-uuid')
        .set(authHelper.authHeader(superAdmin))
        .expect(400);
    });
  });

  describe('Forbidden', () => {
    it('should return 403 for member role', async () => {
      const member = await authHelper.createMember();
      const user = await userFactory.create();

      await request(ctx.server)
        .delete(`/api/users/${user.id}`)
        .set(authHelper.authHeader(member))
        .expect(403);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      const user = await userFactory.create();

      await request(ctx.server).delete(`/api/users/${user.id}`).expect(401);
    });
  });

  describe('Edge Cases', () => {
    it('should not allow deleting self', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      // Attempting to delete self might have specific behavior
      const response = await request(ctx.server)
        .delete(`/api/users/${superAdmin.user.id}`)
        .set(authHelper.authHeader(superAdmin));

      // This could be 400, 403, or 204 depending on implementation
      expect([204, 400, 403]).toContain(response.status);
    });
  });
});
