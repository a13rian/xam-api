import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { CategoryFactory } from '../../support/factories/category.factory';

describe('POST /api/admin/categories', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let categoryFactory: CategoryFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    categoryFactory = new CategoryFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanAllData();
  });

  describe('Happy Path', () => {
    it('should create category as admin', async () => {
      const admin = await authHelper.createSuperAdmin();

      const response = await request(ctx.server)
        .post('/api/admin/categories')
        .set(authHelper.authHeader(admin))
        .send({
          name: 'Beauty Services',
          slug: 'beauty-services',
          description: 'All beauty related services',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'Beauty Services',
        slug: 'beauty-services',
        isActive: true,
      });
    });

    it('should create category with parent', async () => {
      const admin = await authHelper.createSuperAdmin();
      const parentCategory = await categoryFactory.create({
        name: 'Parent Category',
        slug: 'parent-category',
      });

      const response = await request(ctx.server)
        .post('/api/admin/categories')
        .set(authHelper.authHeader(admin))
        .send({
          name: 'Child Category',
          slug: 'child-category',
          parentId: parentCategory.id,
        })
        .expect(201);

      expect(response.body.parentId).toBe(parentCategory.id);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for missing name', async () => {
      const admin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .post('/api/admin/categories')
        .set(authHelper.authHeader(admin))
        .send({
          slug: 'test-category',
        })
        .expect(400);
    });

    it('should return 400 for missing slug', async () => {
      const admin = await authHelper.createSuperAdmin();

      await request(ctx.server)
        .post('/api/admin/categories')
        .set(authHelper.authHeader(admin))
        .send({
          name: 'Test Category',
        })
        .expect(400);
    });
  });

  describe('Conflict', () => {
    it('should return 409 for duplicate slug', async () => {
      const admin = await authHelper.createSuperAdmin();
      await categoryFactory.create({
        slug: 'existing-slug',
      });

      await request(ctx.server)
        .post('/api/admin/categories')
        .set(authHelper.authHeader(admin))
        .send({
          name: 'New Category',
          slug: 'existing-slug',
        })
        .expect(409);
    });
  });

  describe('Forbidden', () => {
    it('should return 403 for non-admin user', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .post('/api/admin/categories')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Test Category',
          slug: 'test-category',
        })
        .expect(403);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server)
        .post('/api/admin/categories')
        .send({
          name: 'Test Category',
          slug: 'test-category',
        })
        .expect(401);
    });
  });
});
