import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { OrganizationFactory } from '../../support/factories/organization.factory';

describe('POST /api/organizations', () => {
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
