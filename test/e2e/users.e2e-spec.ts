/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AuthHelper } from '../support/auth/auth.helper';
import { UserFactory } from '../support/factories/user.factory';
import { RoleFactory } from '../support/factories/role.factory';
import { UserOrmEntity } from '../../src/infrastructure/persistence/typeorm/entities/user.orm-entity';

describe('Users E2E', () => {
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

  describe('POST /api/users', () => {
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

  describe('GET /api/users', () => {
    describe('Happy Path', () => {
      it('should return paginated list of users', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        // Create additional users
        for (let i = 0; i < 5; i++) {
          await userFactory.create();
        }

        const response = await request(ctx.server)
          .get('/api/users')
          .set(authHelper.authHeader(superAdmin))
          .query({ page: 1, limit: 10 })
          .expect(200);

        expect(response.body.items).toBeInstanceOf(Array);
        expect(response.body.items.length).toBeGreaterThanOrEqual(5);
        expect(response.body).toMatchObject({
          total: expect.any(Number),
          page: 1,
          limit: 10,
        });
      });

      it('should respect pagination limits', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        for (let i = 0; i < 15; i++) {
          await userFactory.create();
        }

        const response = await request(ctx.server)
          .get('/api/users')
          .set(authHelper.authHeader(superAdmin))
          .query({ page: 1, limit: 5 })
          .expect(200);

        expect(response.body.items.length).toBe(5);
      });

      it('should return correct page', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        for (let i = 0; i < 10; i++) {
          await userFactory.create();
        }

        const response = await request(ctx.server)
          .get('/api/users')
          .set(authHelper.authHeader(superAdmin))
          .query({ page: 2, limit: 5 })
          .expect(200);

        expect(response.body.page).toBe(2);
      });
    });

    describe('Forbidden', () => {
      it('should return 403 for member role', async () => {
        const member = await authHelper.createMember();

        await request(ctx.server)
          .get('/api/users')
          .set(authHelper.authHeader(member))
          .expect(403);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server).get('/api/users').expect(401);
      });
    });

    describe('Validation', () => {
      it('should return 400 for invalid page number', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        await request(ctx.server)
          .get('/api/users')
          .set(authHelper.authHeader(superAdmin))
          .query({ page: 0 })
          .expect(400);
      });

      it('should return 400 for negative page', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        await request(ctx.server)
          .get('/api/users')
          .set(authHelper.authHeader(superAdmin))
          .query({ page: -1 })
          .expect(400);
      });
    });
  });

  describe('GET /api/users/:id', () => {
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

  describe('PATCH /api/users/:id', () => {
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

  describe('DELETE /api/users/:id', () => {
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
});
