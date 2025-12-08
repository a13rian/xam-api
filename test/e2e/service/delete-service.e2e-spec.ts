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

describe('DELETE /api/partners/me/services/:id', () => {
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
    it('should delete service', async () => {
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
      const service = await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
      });

      await request(ctx.server)
        .delete(`/api/partners/me/services/${service.id}`)
        .set(authHelper.authHeader(user))
        .expect(200);

      // Verify service is deleted
      const listResponse = await request(ctx.server)
        .get('/api/partners/me/services')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(listResponse.body.items).toHaveLength(0);
    });

    it('should delete only specified service when multiple exist', async () => {
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

      const service1 = await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        name: 'Service 1',
      });
      await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        name: 'Service 2',
      });

      await request(ctx.server)
        .delete(`/api/partners/me/services/${service1.id}`)
        .set(authHelper.authHeader(user))
        .expect(200);

      const listResponse = await request(ctx.server)
        .get('/api/partners/me/services')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(listResponse.body.items).toHaveLength(1);
      expect(listResponse.body.items[0].name).toBe('Service 2');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid UUID', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );

      await request(ctx.server)
        .delete('/api/partners/me/services/invalid-uuid')
        .set(authHelper.authHeader(user))
        .expect(400);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if user has no partner profile', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .delete(
          '/api/partners/me/services/00000000-0000-0000-0000-000000000000',
        )
        .set(authHelper.authHeader(user))
        .expect(404);
    });

    it('should return 404 if service does not exist', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );

      await request(ctx.server)
        .delete(
          '/api/partners/me/services/00000000-0000-0000-0000-000000000000',
        )
        .set(authHelper.authHeader(user))
        .expect(404);
    });

    it('should return 404 if service belongs to another partner', async () => {
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
      const service = await serviceFactory.create({
        partnerId: partner2.id,
        categoryId: category.id,
      });

      await request(ctx.server)
        .delete(`/api/partners/me/services/${service.id}`)
        .set(authHelper.authHeader(user1))
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server)
        .delete(
          '/api/partners/me/services/00000000-0000-0000-0000-000000000000',
        )
        .expect(401);
    });
  });
});
