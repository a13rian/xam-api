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

describe('POST /api/partners/me/bookings/:id/confirm', () => {
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
    it('should confirm pending booking', async () => {
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
      const booking = await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
        status: BookingStatusEnum.PENDING,
      });

      const response = await request(ctx.server)
        .post(`/api/partners/me/bookings/${booking.id}/confirm`)
        .set(authHelper.authHeader(partnerUser))
        .expect(200);

      expect(response.body.status).toBe(BookingStatusEnum.CONFIRMED);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid UUID', async () => {
      const partnerUser = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: partnerUser.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        partnerUser.user.id,
        partnerUser.user.email,
      );

      await request(ctx.server)
        .post('/api/partners/me/bookings/invalid-uuid/confirm')
        .set(authHelper.authHeader(partnerUser))
        .expect(400);
    });
  });

  describe('Conflict', () => {
    it('should return 409 for already confirmed booking', async () => {
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
      const booking = await bookingFactory.createConfirmed({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
      });

      await request(ctx.server)
        .post(`/api/partners/me/bookings/${booking.id}/confirm`)
        .set(authHelper.authHeader(partnerUser))
        .expect(409);
    });

    it('should return 409 for cancelled booking', async () => {
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
      const booking = await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
        status: BookingStatusEnum.CANCELLED,
      });

      await request(ctx.server)
        .post(`/api/partners/me/bookings/${booking.id}/confirm`)
        .set(authHelper.authHeader(partnerUser))
        .expect(409);
    });

    it('should return 409 for completed booking', async () => {
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
      const booking = await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
        status: BookingStatusEnum.COMPLETED,
      });

      await request(ctx.server)
        .post(`/api/partners/me/bookings/${booking.id}/confirm`)
        .set(authHelper.authHeader(partnerUser))
        .expect(409);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if user has no partner profile', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .post(
          '/api/partners/me/bookings/00000000-0000-0000-0000-000000000000/confirm',
        )
        .set(authHelper.authHeader(user))
        .expect(404);
    });

    it('should return 404 if booking does not exist', async () => {
      const partnerUser = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: partnerUser.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        partnerUser.user.id,
        partnerUser.user.email,
      );

      await request(ctx.server)
        .post(
          '/api/partners/me/bookings/00000000-0000-0000-0000-000000000000/confirm',
        )
        .set(authHelper.authHeader(partnerUser))
        .expect(404);
    });

    it('should return 404 if booking belongs to another partner', async () => {
      const partnerUser1 = await authHelper.createAuthenticatedUser();
      const partner1 = await partnerFactory.createActive({
        userId: partnerUser1.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner1.id,
        partnerUser1.user.id,
        partnerUser1.user.email,
      );

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
      const booking = await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner2.id,
        locationId: location2.id,
      });

      // Partner1 tries to confirm Partner2's booking
      await request(ctx.server)
        .post(`/api/partners/me/bookings/${booking.id}/confirm`)
        .set(authHelper.authHeader(partnerUser1))
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server)
        .post(
          '/api/partners/me/bookings/00000000-0000-0000-0000-000000000000/confirm',
        )
        .expect(401);
    });
  });
});
