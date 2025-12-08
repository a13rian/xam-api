import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { PartnerFactory } from '../../support/factories/partner.factory';
import { CategoryFactory } from '../../support/factories/category.factory';
import { ServiceFactory } from '../../support/factories/service.factory';
import { PartnerStaffFactory } from '../../support/factories/partner-staff.factory';

describe('GET /api/services', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let partnerFactory: PartnerFactory;
  let categoryFactory: CategoryFactory;
  let serviceFactory: ServiceFactory;
  let partnerStaffFactory: PartnerStaffFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    partnerFactory = new PartnerFactory(ctx.db);
    categoryFactory = new CategoryFactory(ctx.db);
    serviceFactory = new ServiceFactory(ctx.db);
    partnerStaffFactory = new PartnerStaffFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanAllData();
  });

  describe('Happy Path', () => {
    it('should search services without filters (public endpoint)', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );
      const category = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });

      await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        name: 'Haircut',
      });
      await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        name: 'Manicure',
      });

      const response = await request(ctx.server)
        .get('/api/services')
        .expect(200);

      expect(response.body.items).toHaveLength(2);
    });

    it('should filter services by partnerId', async () => {
      const user1 = await authHelper.createAuthenticatedUser();
      const partner1 = await partnerFactory.createActive({
        userId: user1.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner1.id,
        user1.user.id,
        user1.user.email,
      );

      const user2 = await authHelper.createAuthenticatedUser();
      const partner2 = await partnerFactory.createActive({
        userId: user2.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner2.id,
        user2.user.id,
        user2.user.email,
      );

      const category = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });

      await serviceFactory.create({
        partnerId: partner1.id,
        categoryId: category.id,
        name: 'Partner 1 Service',
      });
      await serviceFactory.create({
        partnerId: partner2.id,
        categoryId: category.id,
        name: 'Partner 2 Service',
      });

      const response = await request(ctx.server)
        .get('/api/services')
        .query({ partnerId: partner1.id })
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('Partner 1 Service');
    });

    it('should filter services by categoryId', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );

      const category1 = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });
      const category2 = await categoryFactory.create({
        name: 'Spa',
        slug: 'spa',
      });

      await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category1.id,
        name: 'Haircut',
      });
      await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category2.id,
        name: 'Massage',
      });

      const response = await request(ctx.server)
        .get('/api/services')
        .query({ categoryId: category1.id })
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('Haircut');
    });

    it('should only show active services by default', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );
      const category = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });

      await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        name: 'Active Service',
        isActive: true,
      });
      await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        name: 'Inactive Service',
        isActive: false,
      });

      const response = await request(ctx.server)
        .get('/api/services')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('Active Service');
    });

    it('should support pagination', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );
      const category = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });

      for (let i = 1; i <= 15; i++) {
        await serviceFactory.create({
          partnerId: partner.id,
          categoryId: category.id,
          name: `Service ${i}`,
        });
      }

      const page1 = await request(ctx.server)
        .get('/api/services')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(page1.body.items).toHaveLength(10);

      const page2 = await request(ctx.server)
        .get('/api/services')
        .query({ page: 2, limit: 10 })
        .expect(200);

      expect(page2.body.items).toHaveLength(5);
    });

    it('should search by service name', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );
      const category = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });

      await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        name: 'Premium Haircut',
      });
      await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        name: 'Basic Manicure',
      });
      await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        name: 'Premium Massage',
      });

      const response = await request(ctx.server)
        .get('/api/services')
        .query({ search: 'Premium' })
        .expect(200);

      expect(response.body.items).toHaveLength(2);
    });

    it('should return empty list when no services match filters', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );
      const category = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });

      await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        name: 'Haircut',
      });

      const response = await request(ctx.server)
        .get('/api/services')
        .query({ search: 'Nonexistent' })
        .expect(200);

      expect(response.body.items).toHaveLength(0);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid partnerId', async () => {
      await request(ctx.server)
        .get('/api/services')
        .query({ partnerId: 'invalid-uuid' })
        .expect(400);
    });

    it('should return 400 for invalid categoryId', async () => {
      await request(ctx.server)
        .get('/api/services')
        .query({ categoryId: 'invalid-uuid' })
        .expect(400);
    });
  });
});
