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

describe('GET /api/bookings/:id', () => {
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
    it('should get booking by id', async () => {
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
        customerName: 'Test Customer',
        customerPhone: '0901234567',
      });

      const response = await request(ctx.server)
        .get(`/api/bookings/${booking.id}`)
        .set(authHelper.authHeader(customer))
        .expect(200);

      expect(response.body).toMatchObject({
        id: booking.id,
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
      });
    });

    it('should return booking with all details', async () => {
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

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const booking = await bookingFactory.create({
        customerId: customer.user.id,
        partnerId: partner.id,
        locationId: location.id,
        customerName: 'Test Customer',
        customerPhone: '0901234567',
        scheduledDate: tomorrow,
        startTime: '14:00',
        endTime: '15:00',
        notes: 'Test notes',
      });

      const response = await request(ctx.server)
        .get(`/api/bookings/${booking.id}`)
        .set(authHelper.authHeader(customer))
        .expect(200);

      expect(response.body.startTime).toMatch(/^14:00/);
      expect(response.body.endTime).toMatch(/^15:00/);
      expect(response.body.notes).toBe('Test notes');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid UUID', async () => {
      const customer = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .get('/api/bookings/invalid-uuid')
        .set(authHelper.authHeader(customer))
        .expect(400);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if booking does not exist', async () => {
      const customer = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .get('/api/bookings/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(customer))
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

      // Customer1 tries to access customer2's booking
      await request(ctx.server)
        .get(`/api/bookings/${booking.id}`)
        .set(authHelper.authHeader(customer1))
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server)
        .get('/api/bookings/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });
  });
});
