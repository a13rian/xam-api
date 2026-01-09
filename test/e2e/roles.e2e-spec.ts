/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AuthHelper } from '../support/auth/auth.helper';
import { RoleFactory } from '../support/factories/role.factory';
import { RoleOrmEntity } from '../../src/infrastructure/persistence/typeorm/entities/role.orm-entity';

describe('Roles E2E', () => {
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

  describe('POST /api/roles', () => {
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

  describe('GET /api/roles', () => {
    describe('Happy Path', () => {
      it('should list all roles including system roles', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .get('/api/roles')
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body.items).toBeInstanceOf(Array);
        // Should have at least the system roles (super_admin, admin, member)
        expect(response.body.items.length).toBeGreaterThanOrEqual(3);
      });

      it('should include custom roles', async () => {
        const superAdmin = await authHelper.createSuperAdmin();
        await roleFactory.create({ name: 'custom-test-role' });

        const response = await request(ctx.server)
          .get('/api/roles')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        const customRole = response.body.items.find(
          (r: { name: string }) => r.name === 'custom-test-role',
        );
        expect(customRole).toBeDefined();
      });

      it('should filter system roles', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .get('/api/roles')
          .set(authHelper.authHeader(user))
          .query({ includeSystemRoles: true })
          .expect(200);

        const systemRoles = response.body.items.filter(
          (r: { isSystem: boolean }) => r.isSystem,
        );
        expect(systemRoles.length).toBeGreaterThan(0);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server).get('/api/roles').expect(401);
      });
    });
  });

  describe('GET /api/roles/:id', () => {
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

    describe('Not Found', () => {
      it('should return 404 for non-existent role', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .get('/api/roles/not-a-valid-id')
          .set(authHelper.authHeader(user))
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        const role = await roleFactory.create();

        await request(ctx.server).get(`/api/roles/${role.id}`).expect(401);
      });
    });
  });

  describe('PATCH /api/roles/:id', () => {
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

  describe('DELETE /api/roles/:id', () => {
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

    describe('Not Found', () => {
      it('should return 404 for non-existent role', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        await request(ctx.server)
          .delete('/api/roles/not-a-valid-id')
          .set(authHelper.authHeader(superAdmin))
          .expect(404);
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

  describe('GET /api/roles/permissions', () => {
    describe('Happy Path', () => {
      it('should list all permissions', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .get('/api/roles/permissions')
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body.items).toBeInstanceOf(Array);
        expect(response.body.items.length).toBeGreaterThan(0);
        expect(response.body.items[0]).toMatchObject({
          id: expect.any(String),
          code: expect.any(String),
          name: expect.any(String),
          resource: expect.any(String),
          action: expect.any(String),
        });
      });

      it('should filter permissions by resource', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .get('/api/roles/permissions')
          .set(authHelper.authHeader(user))
          .query({ resource: 'user' })
          .expect(200);

        expect(
          response.body.items.every(
            (p: { resource: string }) => p.resource === 'user',
          ),
        ).toBe(true);
      });

      it('should include all permission fields', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .get('/api/roles/permissions')
          .set(authHelper.authHeader(user))
          .expect(200);

        const permission = response.body.items[0];
        expect(permission.id).toBeDefined();
        expect(permission.code).toBeDefined();
        expect(permission.name).toBeDefined();
        expect(permission.resource).toBeDefined();
        expect(permission.action).toBeDefined();
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server).get('/api/roles/permissions').expect(401);
      });

      it('should return 401 with invalid token', async () => {
        await request(ctx.server)
          .get('/api/roles/permissions')
          .set('Authorization', `Bearer ${authHelper.createInvalidToken()}`)
          .expect(401);
      });
    });
  });
});
