import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { PartnerFactory } from '../../support/factories/partner.factory';
import { LocationFactory } from '../../support/factories/location.factory';
import { BookingFactory } from '../../support/factories/booking.factory';
import { PartnerStaffFactory } from '../../support/factories/partner-staff.factory';
import { BookingStatusEnum } from '../../../src/core/domain/booking/value-objects/booking-status.vo';

describe('GET /api/bookings/me', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let partnerFactory: PartnerFactory;
  let locationFactory: LocationFactory;
  let bookingFactory: BookingFactory;
  let partnerStaffFactory: PartnerStaffFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    partnerFactory = new PartnerFactory(ctx.db);
    locationFactory = new LocationFactory(ctx.db);
    bookingFactory = new BookingFactory(ctx.db);
    partnerStaffFactory = new PartnerStaffFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanAllData();
  });

  describe('Happy Path', () => {
    it('should list all bookings for customer', async () => {
      const customer = await authHelper.createAuthenticatedUser();

      const partnerUser = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: partnerUser.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        partnerUser.user.id,
        partnerUser.user.email,
      );
      const location = await locationFactory.create({
        partnerId: partner.id,
      });

      await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
      });
      await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
      });
      await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
      });

      const response = await request(ctx.server)
        .get('/api/bookings/me')
        .set(authHelper.authHeader(customer))
        .expect(200);

      expect(response.body.items).toHaveLength(3);
    });

    it('should return empty list when customer has no bookings', async () => {
      const customer = await authHelper.createAuthenticatedUser();

      const response = await request(ctx.server)
        .get('/api/bookings/me')
        .set(authHelper.authHeader(customer))
        .expect(200);

      expect(response.body.items).toHaveLength(0);
    });

    it('should filter by status', async () => {
      const customer = await authHelper.createAuthenticatedUser();

      const partnerUser = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: partnerUser.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        partnerUser.user.id,
        partnerUser.user.email,
      );
      const location = await locationFactory.create({
        partnerId: partner.id,
      });

      await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
        status: BookingStatusEnum.PENDING,
      });
      await bookingFactory.createConfirmed({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
      });
      await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
        status: BookingStatusEnum.COMPLETED,
      });

      const response = await request(ctx.server)
        .get('/api/bookings/me')
        .query({ status: BookingStatusEnum.PENDING })
        .set(authHelper.authHeader(customer))
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].status).toBe(BookingStatusEnum.PENDING);
    });

    it('should support pagination', async () => {
      const customer = await authHelper.createAuthenticatedUser();

      const partnerUser = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: partnerUser.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        partnerUser.user.id,
        partnerUser.user.email,
      );
      const location = await locationFactory.create({
        partnerId: partner.id,
      });

      for (let i = 0; i < 15; i++) {
        await bookingFactory.create({
          customerId: customer.user.id,
          partnerId: partner.id,
          locationId: location.id,
        });
      }

      const page1 = await request(ctx.server)
        .get('/api/bookings/me')
        .query({ page: 1, limit: 10 })
        .set(authHelper.authHeader(customer))
        .expect(200);

      expect(page1.body.items).toHaveLength(10);

      const page2 = await request(ctx.server)
        .get('/api/bookings/me')
        .query({ page: 2, limit: 10 })
        .set(authHelper.authHeader(customer))
        .expect(200);

      expect(page2.body.items).toHaveLength(5);
    });

    it('should not include other customers bookings', async () => {
      const customer1 = await authHelper.createAuthenticatedUser();
      const customer2 = await authHelper.createAuthenticatedUser();

      const partnerUser = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: partnerUser.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        partnerUser.user.id,
        partnerUser.user.email,
      );
      const location = await locationFactory.create({
        partnerId: partner.id,
      });

      await bookingFactory.create({
        customerId: customer1.user.id,
        partnerId: partner.id,
        locationId: location.id,
      });
      await bookingFactory.create({
        customerId: customer2.user.id,
        partnerId: partner.id,
        locationId: location.id,
      });

      const response = await request(ctx.server)
        .get('/api/bookings/me')
        .set(authHelper.authHeader(customer1))
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].customerId).toBe(customer1.user.id);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server).get('/api/bookings/me').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(ctx.server)
        .get('/api/bookings/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
