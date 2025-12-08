import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { CategoryFactory } from '../../support/factories/category.factory';

describe('GET /api/categories', () => {
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
    it('should list categories (public endpoint)', async () => {
      await categoryFactory.create({ name: 'Category 1', slug: 'category-1' });
      await categoryFactory.create({ name: 'Category 2', slug: 'category-2' });

      const response = await request(ctx.server)
        .get('/api/categories')
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.total).toBe(2);
    });

    it('should return only active categories', async () => {
      await categoryFactory.create({
        name: 'Active Category',
        slug: 'active',
        isActive: true,
      });
      await categoryFactory.create({
        name: 'Inactive Category',
        slug: 'inactive',
        isActive: false,
      });

      const response = await request(ctx.server)
        .get('/api/categories')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('Active Category');
    });

    it('should list categories with pagination', async () => {
      for (let i = 0; i < 5; i++) {
        await categoryFactory.create();
      }

      const response = await request(ctx.server)
        .get('/api/categories?page=1&limit=2')
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.total).toBe(5);
    });
  });
});
