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

describe('POST /api/bookings/:id/cancel', () => {
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
    it('should cancel pending booking', async () => {
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

      const booking = await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
        status: BookingStatusEnum.PENDING,
      });

      const response = await request(ctx.server)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set(authHelper.authHeader(customer))
        .send({
          reason: 'Changed my plans',
        })
        .expect(200);

      expect(response.body.status).toBe(BookingStatusEnum.CANCELLED);
    });

    it('should cancel confirmed booking', async () => {
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

      const booking = await bookingFactory.createConfirmed({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
      });

      const response = await request(ctx.server)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set(authHelper.authHeader(customer))
        .send({
          reason: 'Emergency came up',
        })
        .expect(200);

      expect(response.body.status).toBe(BookingStatusEnum.CANCELLED);
    });

    it('should cancel without reason', async () => {
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

      const booking = await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
      });

      const response = await request(ctx.server)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set(authHelper.authHeader(customer))
        .send({})
        .expect(200);

      expect(response.body.status).toBe(BookingStatusEnum.CANCELLED);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid UUID', async () => {
      const customer = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .post('/api/bookings/invalid-uuid/cancel')
        .set(authHelper.authHeader(customer))
        .send({})
        .expect(400);
    });
  });

  describe('Conflict', () => {
    it('should return 409 for already cancelled booking', async () => {
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

      const booking = await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
        status: BookingStatusEnum.CANCELLED,
      });

      await request(ctx.server)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set(authHelper.authHeader(customer))
        .send({})
        .expect(409);
    });

    it('should return 409 for completed booking', async () => {
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

      const booking = await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
        status: BookingStatusEnum.COMPLETED,
      });

      await request(ctx.server)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set(authHelper.authHeader(customer))
        .send({})
        .expect(409);
    });

    it('should return 409 for in-progress booking', async () => {
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

      const booking = await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
        status: BookingStatusEnum.IN_PROGRESS,
      });

      await request(ctx.server)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set(authHelper.authHeader(customer))
        .send({})
        .expect(409);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if booking does not exist', async () => {
      const customer = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .post('/api/bookings/00000000-0000-0000-0000-000000000000/cancel')
        .set(authHelper.authHeader(customer))
        .send({})
        .expect(404);
    });

    it('should return 404 if booking belongs to another customer', async () => {
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

      const booking = await bookingFactory.create({
        customerId: customer2.user.id,
        partnerId: partner.id,
        locationId: location.id,
      });

      await request(ctx.server)
        .post(`/api/bookings/${booking.id}/cancel`)
        .set(authHelper.authHeader(customer1))
        .send({})
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server)
        .post('/api/bookings/00000000-0000-0000-0000-000000000000/cancel')
        .send({})
        .expect(401);
    });
  });
});
