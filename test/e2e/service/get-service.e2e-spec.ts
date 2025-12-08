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
import { BookingTypeEnum } from '../../../src/core/domain/service/value-objects/booking-type.vo';

describe('GET /api/services/:id', () => {
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
    it('should get service by id (public endpoint)', async () => {
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
        name: 'Premium Haircut',
        priceAmount: 200000,
        durationMinutes: 45,
      });

      // Should work without authentication (public endpoint)
      const response = await request(ctx.server)
        .get(`/api/services/${service.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: service.id,
        name: 'Premium Haircut',
        price: 200000,
        durationMinutes: 45,
      });
    });

    it('should get service with all fields', async () => {
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
        name: 'Spa',
        slug: 'spa',
      });
      const service = await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        name: 'Full Body Massage',
        description: 'Relaxing full body massage',
        priceAmount: 500000,
        priceCurrency: 'VND',
        durationMinutes: 90,
        bookingType: BookingTypeEnum.TIME_SLOT,
        sortOrder: 1,
      });

      const response = await request(ctx.server)
        .get(`/api/services/${service.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: service.id,
        name: 'Full Body Massage',
        price: 500000,
        durationMinutes: 90,
        categoryId: category.id,
        partnerId: partner.id,
      });
    });

    it('should work with authenticated user too', async () => {
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

      const response = await request(ctx.server)
        .get(`/api/services/${service.id}`)
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body.id).toBe(service.id);
    });

    it('should get inactive service', async () => {
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
        name: 'Inactive Service',
        isActive: false,
      });

      const response = await request(ctx.server)
        .get(`/api/services/${service.id}`)
        .expect(200);

      expect(response.body.id).toBe(service.id);
      expect(response.body.isActive).toBe(false);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid UUID', async () => {
      await request(ctx.server).get('/api/services/invalid-uuid').expect(400);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if service does not exist', async () => {
      await request(ctx.server)
        .get('/api/services/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
