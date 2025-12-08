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

describe('GET /api/partners/me/bookings', () => {
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
    it('should list all bookings for partner', async () => {
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

      const customer1 = await authHelper.createAuthenticatedUser();
      const customer2 = await authHelper.createAuthenticatedUser();

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
      await bookingFactory.create({
        customerId: customer1.user.id,
        partnerId: partner.id,
        locationId: location.id,
      });

      const response = await request(ctx.server)
        .get('/api/partners/me/bookings')
        .set(authHelper.authHeader(partnerUser))
        .expect(200);

      expect(response.body.items).toHaveLength(3);
    });

    it('should return empty list when partner has no bookings', async () => {
      const partnerUser = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: partnerUser.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        partnerUser.user.id,
        partnerUser.user.email,
      );

      const response = await request(ctx.server)
        .get('/api/partners/me/bookings')
        .set(authHelper.authHeader(partnerUser))
        .expect(200);

      expect(response.body.items).toHaveLength(0);
    });

    it('should filter by status', async () => {
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

      const customer = await authHelper.createAuthenticatedUser();

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
        .get('/api/partners/me/bookings')
        .query({ status: BookingStatusEnum.CONFIRMED })
        .set(authHelper.authHeader(partnerUser))
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].status).toBe(BookingStatusEnum.CONFIRMED);
    });

    it('should filter by date range', async () => {
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

      const customer = await authHelper.createAuthenticatedUser();

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
        scheduledDate: tomorrow,
      });
      await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
        scheduledDate: nextWeek,
      });

      const response = await request(ctx.server)
        .get('/api/partners/me/bookings')
        .query({
          startDate: today.toISOString().split('T')[0],
          endDate: tomorrow.toISOString().split('T')[0],
        })
        .set(authHelper.authHeader(partnerUser))
        .expect(200);

      expect(response.body.items).toHaveLength(1);
    });

    it('should support pagination', async () => {
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

      const customer = await authHelper.createAuthenticatedUser();

      for (let i = 0; i < 15; i++) {
        await bookingFactory.create({
          customerId: customer.user.id,
          partnerId: partner.id,
          locationId: location.id,
        });
      }

      const page1 = await request(ctx.server)
        .get('/api/partners/me/bookings')
        .query({ page: 1, limit: 10 })
        .set(authHelper.authHeader(partnerUser))
        .expect(200);

      expect(page1.body.items).toHaveLength(10);

      const page2 = await request(ctx.server)
        .get('/api/partners/me/bookings')
        .query({ page: 2, limit: 10 })
        .set(authHelper.authHeader(partnerUser))
        .expect(200);

      expect(page2.body.items).toHaveLength(5);
    });

    it('should not include bookings from other partners', async () => {
      const partnerUser1 = await authHelper.createAuthenticatedUser();
      const partner1 = await partnerFactory.createActive({
        userId: partnerUser1.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner1.id,
        partnerUser1.user.id,
        partnerUser1.user.email,
      );
      const location1 = await locationFactory.create({
        partnerId: partner1.id,
      });

      const partnerUser2 = await authHelper.createAuthenticatedUser();
      const partner2 = await partnerFactory.createActive({
        userId: partnerUser2.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner2.id,
        partnerUser2.user.id,
        partnerUser2.user.email,
      );
      const location2 = await locationFactory.create({
        partnerId: partner2.id,
      });

      const customer = await authHelper.createAuthenticatedUser();

      await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner1.id,
        locationId: location1.id,
      });
      await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner2.id,
        locationId: location2.id,
      });

      const response = await request(ctx.server)
        .get('/api/partners/me/bookings')
        .set(authHelper.authHeader(partnerUser1))
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].partnerId).toBe(partner1.id);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if user has no partner profile', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .get('/api/partners/me/bookings')
        .set(authHelper.authHeader(user))
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server).get('/api/partners/me/bookings').expect(401);
    });
  });
});
