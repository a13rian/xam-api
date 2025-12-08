/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call */
import request from 'supertest';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AuthHelper } from '../support/auth/auth.helper';
import { OrganizationFactory } from '../support/factories/organization.factory';
import { OrganizationOrmEntity } from '../../src/infrastructure/persistence/typeorm/entities/organization.orm-entity';

describe('Organizations E2E', () => {
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

  describe('POST /api/organizations', () => {
    describe('Happy Path', () => {
      it('should create organization for authenticated user', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .post('/api/organizations')
          .set(authHelper.authHeader(user))
          .send({
            name: 'Test Organization',
            slug: 'test-org',
            description: 'A test organization',
          })
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(String),
          name: 'Test Organization',
          slug: 'test-org',
          ownerId: user.user.id,
        });
      });

      it('should create organization without description', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .post('/api/organizations')
          .set(authHelper.authHeader(user))
          .send({
            name: 'Minimal Org',
            slug: 'minimal-org',
          })
          .expect(201);

        expect(response.body.description).toBeNull();
      });

      it('should create organization with slug containing numbers', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .post('/api/organizations')
          .set(authHelper.authHeader(user))
          .send({
            name: 'Org 2024',
            slug: 'org-2024',
          })
          .expect(201);

        expect(response.body.slug).toBe('org-2024');
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for invalid slug format (spaces)', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/organizations')
          .set(authHelper.authHeader(user))
          .send({
            name: 'Test Org',
            slug: 'Invalid Slug With Spaces',
          })
          .expect(400);
      });

      it('should return 400 for slug with uppercase', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/organizations')
          .set(authHelper.authHeader(user))
          .send({
            name: 'Test Org',
            slug: 'UpperCase',
          })
          .expect(400);
      });

      it('should return 400 for name too long', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/organizations')
          .set(authHelper.authHeader(user))
          .send({
            name: 'A'.repeat(201),
            slug: 'valid-slug',
          })
          .expect(400);
      });

      it('should return 400 for missing name', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/organizations')
          .set(authHelper.authHeader(user))
          .send({
            slug: 'valid-slug',
          })
          .expect(400);
      });

      it('should return 400 for missing slug', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/organizations')
          .set(authHelper.authHeader(user))
          .send({
            name: 'Test Org',
          })
          .expect(400);
      });
    });

    describe('Conflict', () => {
      it('should return 409 for duplicate slug', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await orgFactory.create({
          slug: 'existing-slug',
          ownerId: user.user.id,
        });

        await request(ctx.server)
          .post('/api/organizations')
          .set(authHelper.authHeader(user))
          .send({
            name: 'New Org',
            slug: 'existing-slug',
          })
          .expect(409);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .post('/api/organizations')
          .send({
            name: 'Test Org',
            slug: 'test-org',
          })
          .expect(401);
      });
    });
  });

  describe('GET /api/organizations/:id', () => {
    describe('Happy Path', () => {
      it('should get organization by id', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const org = await orgFactory.create({
          name: 'Test Org',
          slug: 'test-org',
          ownerId: user.user.id,
        });

        const response = await request(ctx.server)
          .get(`/api/organizations/${org.id}`)
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body).toMatchObject({
          id: org.id,
          name: 'Test Org',
          slug: 'test-org',
          ownerId: user.user.id,
        });
      });

      it('should include all organization fields', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const org = await orgFactory.create({
          name: 'Full Org',
          slug: 'full-org',
          description: 'Full description',
          ownerId: user.user.id,
        });

        const response = await request(ctx.server)
          .get(`/api/organizations/${org.id}`)
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body).toMatchObject({
          id: org.id,
          name: 'Full Org',
          slug: 'full-org',
          description: 'Full description',
          isActive: true,
        });
        expect(response.body.createdAt).toBeDefined();
        expect(response.body.updatedAt).toBeDefined();
      });
    });

    describe('Not Found', () => {
      it('should return 404 for non-existent organization', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .get('/api/organizations/00000000-0000-0000-0000-000000000000')
          .set(authHelper.authHeader(user))
          .expect(404);
      });
    });

    describe('Validation', () => {
      it('should return 400 for invalid UUID', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .get('/api/organizations/not-a-uuid')
          .set(authHelper.authHeader(user))
          .expect(400);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        const user = await authHelper.createUser();
        const org = await orgFactory.create({ ownerId: user.id });

        await request(ctx.server)
          .get(`/api/organizations/${org.id}`)
          .expect(401);
      });
    });
  });

  describe('GET /api/organizations', () => {
    describe('Happy Path', () => {
      it('should allow super_admin to list all organizations', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        await orgFactory.create({ ownerId: superAdmin.user.id });
        await orgFactory.create({ ownerId: superAdmin.user.id });

        const response = await request(ctx.server)
          .get('/api/organizations')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        expect(response.body.items.length).toBe(2);
      });

      it('should return paginated results', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        for (let i = 0; i < 10; i++) {
          await orgFactory.create({ ownerId: superAdmin.user.id });
        }

        const response = await request(ctx.server)
          .get('/api/organizations')
          .set(authHelper.authHeader(superAdmin))
          .query({ page: 1, limit: 5 })
          .expect(200);

        expect(response.body.items.length).toBe(5);
        expect(response.body.total).toBe(10);
      });

      it('should filter by ownerId', async () => {
        const superAdmin = await authHelper.createSuperAdmin();
        const otherUser = await authHelper.createUser();

        await orgFactory.create({ ownerId: superAdmin.user.id });
        await orgFactory.create({ ownerId: otherUser.id });

        const response = await request(ctx.server)
          .get('/api/organizations')
          .set(authHelper.authHeader(superAdmin))
          .query({ ownerId: superAdmin.user.id })
          .expect(200);

        expect(
          response.body.items.every(
            (o: { ownerId: string }) => o.ownerId === superAdmin.user.id,
          ),
        ).toBe(true);
      });
    });

    describe('Forbidden', () => {
      it('should return 403 for admin role', async () => {
        const admin = await authHelper.createAdmin();

        await request(ctx.server)
          .get('/api/organizations')
          .set(authHelper.authHeader(admin))
          .expect(403);
      });

      it('should return 403 for member role', async () => {
        const member = await authHelper.createMember();

        await request(ctx.server)
          .get('/api/organizations')
          .set(authHelper.authHeader(member))
          .expect(403);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server).get('/api/organizations').expect(401);
      });
    });
  });

  describe('PATCH /api/organizations/:id', () => {
    describe('Happy Path', () => {
      it('should update organization name', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const org = await orgFactory.create({
          name: 'Original Name',
          ownerId: user.user.id,
        });

        const response = await request(ctx.server)
          .patch(`/api/organizations/${org.id}`)
          .set(authHelper.authHeader(user))
          .send({
            name: 'Updated Name',
          })
          .expect(200);

        expect(response.body.name).toBe('Updated Name');
      });

      it('should update organization description', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const org = await orgFactory.create({
          ownerId: user.user.id,
        });

        const response = await request(ctx.server)
          .patch(`/api/organizations/${org.id}`)
          .set(authHelper.authHeader(user))
          .send({
            description: 'New description',
          })
          .expect(200);

        expect(response.body.description).toBe('New description');
      });

      it('should deactivate organization', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const org = await orgFactory.create({
          ownerId: user.user.id,
        });

        const response = await request(ctx.server)
          .patch(`/api/organizations/${org.id}`)
          .set(authHelper.authHeader(user))
          .send({
            isActive: false,
          })
          .expect(200);

        expect(response.body.isActive).toBe(false);
      });

      it('should allow partial update', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const org = await orgFactory.create({
          name: 'Original',
          description: 'Original desc',
          ownerId: user.user.id,
        });

        const response = await request(ctx.server)
          .patch(`/api/organizations/${org.id}`)
          .set(authHelper.authHeader(user))
          .send({
            name: 'Updated',
          })
          .expect(200);

        expect(response.body.name).toBe('Updated');
        expect(response.body.description).toBe('Original desc');
      });
    });

    describe('Not Found', () => {
      it('should return 404 for non-existent organization', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .patch('/api/organizations/00000000-0000-0000-0000-000000000000')
          .set(authHelper.authHeader(user))
          .send({
            name: 'Updated',
          })
          .expect(404);
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for name too long', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const org = await orgFactory.create({ ownerId: user.user.id });

        await request(ctx.server)
          .patch(`/api/organizations/${org.id}`)
          .set(authHelper.authHeader(user))
          .send({
            name: 'A'.repeat(201),
          })
          .expect(400);
      });

      it('should return 400 for description too long', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const org = await orgFactory.create({ ownerId: user.user.id });

        await request(ctx.server)
          .patch(`/api/organizations/${org.id}`)
          .set(authHelper.authHeader(user))
          .send({
            description: 'A'.repeat(1001),
          })
          .expect(400);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        const user = await authHelper.createUser();
        const org = await orgFactory.create({ ownerId: user.id });

        await request(ctx.server)
          .patch(`/api/organizations/${org.id}`)
          .send({
            name: 'Updated',
          })
          .expect(401);
      });
    });
  });

  describe('DELETE /api/organizations/:id', () => {
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
});
