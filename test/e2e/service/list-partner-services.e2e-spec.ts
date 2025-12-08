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

describe('GET /api/partners/me/services', () => {
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
    it('should list all services for partner', async () => {
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
        name: 'Service 1',
      });
      await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        name: 'Service 2',
      });
      await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        name: 'Service 3',
      });

      const response = await request(ctx.server)
        .get('/api/partners/me/services')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body.items).toHaveLength(3);
      expect(response.body.total).toBe(3);
    });

    it('should return empty list when partner has no services', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );

      const response = await request(ctx.server)
        .get('/api/partners/me/services')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should not include services from other partners', async () => {
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
        .get('/api/partners/me/services')
        .set(authHelper.authHeader(user1))
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('Partner 1 Service');
    });

    it('should include both active and inactive services', async () => {
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
        .get('/api/partners/me/services')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body.items).toHaveLength(2);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if user has no partner profile', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .get('/api/partners/me/services')
        .set(authHelper.authHeader(user))
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server).get('/api/partners/me/services').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(ctx.server)
        .get('/api/partners/me/services')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
