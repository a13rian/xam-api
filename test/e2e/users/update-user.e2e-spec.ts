import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { UserFactory } from '../../support/factories/user.factory';
import { RoleFactory } from '../../support/factories/role.factory';

describe('PATCH /api/users/:id', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let userFactory: UserFactory;
  let roleFactory: RoleFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    userFactory = new UserFactory(ctx.db);
    roleFactory = new RoleFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanUsersAndOrganizations();
  });

  describe('Happy Path', () => {
    it('should update user firstName and lastName', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const user = await userFactory.create();

      const response = await request(ctx.server)
        .patch(`/api/users/${user.id}`)
        .set(authHelper.authHeader(superAdmin))
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        id: user.id,
        firstName: 'Updated',
        lastName: 'Name',
      });
    });

    it('should update user roles', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const user = await userFactory.create({ roleNames: ['member'] });
      const adminRole = await roleFactory.getSystemRole('admin');

      const response = await request(ctx.server)
        .patch(`/api/users/${user.id}`)
        .set(authHelper.authHeader(superAdmin))
        .send({
          roleIds: [adminRole!.id],
        })
        .expect(200);

      expect(response.body.roleIds).toContain(adminRole!.id);
    });

    it('should deactivate user', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const user = await userFactory.create();

      const response = await request(ctx.server)
        .patch(`/api/users/${user.id}`)
        .set(authHelper.authHeader(superAdmin))
        .send({
          isActive: false,
        })
        .expect(200);

      expect(response.body.isActive).toBe(false);
    });

    it('should allow partial update', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const user = await userFactory.create({
        firstName: 'Original',
        lastName: 'Name',
      });

      const response = await request(ctx.server)
        .patch(`/api/users/${user.id}`)
        .set(authHelper.authHeader(superAdmin))
        .send({
          firstName: 'Updated',
        })
        .expect(200);

      expect(response.body.firstName).toBe('Updated');
      expect(response.body.lastName).toBe('Name');
    });
  });

  describe('Not Found', () => {
    it('should return 404 for non-existent user', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .patch('/api/users/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(superAdmin))
        .send({
          firstName: 'Updated',
        })
        .expect(404);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for firstName exceeding max length', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const user = await userFactory.create();

      await request(ctx.server)
        .patch(`/api/users/${user.id}`)
        .set(authHelper.authHeader(superAdmin))
        .send({
          firstName: 'A'.repeat(101),
        })
        .expect(400);
    });

    it('should return 400 for invalid UUID in roleIds', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const user = await userFactory.create();

      await request(ctx.server)
        .patch(`/api/users/${user.id}`)
        .set(authHelper.authHeader(superAdmin))
        .send({
          roleIds: ['not-a-uuid'],
        })
        .expect(400);
    });
  });

  describe('Forbidden', () => {
    it('should return 403 for member role', async () => {
      const member = await authHelper.createMember();
      const user = await userFactory.create();

      await request(ctx.server)
        .patch(`/api/users/${user.id}`)
        .set(authHelper.authHeader(member))
        .send({
          firstName: 'Updated',
        })
        .expect(403);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      const user = await userFactory.create();

      await request(ctx.server)
        .patch(`/api/users/${user.id}`)
        .send({
          firstName: 'Updated',
        })
        .expect(401);
    });
  });
});
