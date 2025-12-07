import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { UserFactory } from '../../support/factories/user.factory';
import { RoleFactory } from '../../support/factories/role.factory';

describe('POST /api/users', () => {
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
    it('should allow super_admin to create user', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      const response = await request(ctx.server)
        .post('/api/users')
        .set(authHelper.authHeader(superAdmin))
        .send({
          email: 'newuser@test.com',
          password: 'SecurePass123!',
          firstName: 'New',
          lastName: 'User',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
      });
    });

    it('should allow admin to create user', async () => {
      const admin = await authHelper.createAdmin();

      const response = await request(ctx.server)
        .post('/api/users')
        .set(authHelper.authHeader(admin))
        .send({
          email: 'adminuser@test.com',
          password: 'SecurePass123!',
          firstName: 'Admin',
          lastName: 'Created',
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
    });

    it('should create user with roles', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const memberRole = await roleFactory.getSystemRole('member');

      const response = await request(ctx.server)
        .post('/api/users')
        .set(authHelper.authHeader(superAdmin))
        .send({
          email: 'roleuser@test.com',
          password: 'SecurePass123!',
          firstName: 'Role',
          lastName: 'User',
          roleIds: [memberRole!.id],
        })
        .expect(201);

      expect(response.body.roleIds).toContain(memberRole!.id);
    });
  });

  describe('Forbidden', () => {
    it('should return 403 for member role', async () => {
      const member = await authHelper.createMember();

      await request(ctx.server)
        .post('/api/users')
        .set(authHelper.authHeader(member))
        .send({
          email: 'forbidden@test.com',
          password: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(403);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server)
        .post('/api/users')
        .send({
          email: 'noauth@test.com',
          password: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(401);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid email', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .post('/api/users')
        .set(authHelper.authHeader(superAdmin))
        .send({
          email: 'invalid',
          password: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should return 400 for invalid UUID in roleIds', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .post('/api/users')
        .set(authHelper.authHeader(superAdmin))
        .send({
          email: 'user@test.com',
          password: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'User',
          roleIds: ['not-a-uuid'],
        })
        .expect(400);
    });

    it('should return 400 for password too short', async () => {
      const superAdmin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .post('/api/users')
        .set(authHelper.authHeader(superAdmin))
        .send({
          email: 'user@test.com',
          password: 'short',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });
  });

  describe('Conflict', () => {
    it('should return 409 for duplicate email', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      await userFactory.create({ email: 'duplicate@test.com' });

      await request(ctx.server)
        .post('/api/users')
        .set(authHelper.authHeader(superAdmin))
        .send({
          email: 'duplicate@test.com',
          password: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(409);
    });
  });
});
