/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AuthHelper } from '../support/auth/auth.helper';
import { PartnerFactory } from '../support/factories/partner.factory';
import { LocationFactory } from '../support/factories/location.factory';
import { CategoryFactory } from '../support/factories/category.factory';
import { ServiceFactory } from '../support/factories/service.factory';
import { BookingFactory } from '../support/factories/booking.factory';
import { PartnerStaffFactory } from '../support/factories/partner-staff.factory';
import { BookingStatusEnum } from '../../src/core/domain/booking/value-objects/booking-status.vo';

describe('Booking E2E', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let partnerFactory: PartnerFactory;
  let locationFactory: LocationFactory;
  let categoryFactory: CategoryFactory;
  let serviceFactory: ServiceFactory;
  let bookingFactory: BookingFactory;
  let partnerStaffFactory: PartnerStaffFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    partnerFactory = new PartnerFactory(ctx.db);
    locationFactory = new LocationFactory(ctx.db);
    categoryFactory = new CategoryFactory(ctx.db);
    serviceFactory = new ServiceFactory(ctx.db);
    bookingFactory = new BookingFactory(ctx.db);
    partnerStaffFactory = new PartnerStaffFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanAllData();
  });

  // Helper functions
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  describe('POST /api/bookings', () => {
    describe('Happy Path', () => {
      it('should create booking with required fields', async () => {
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
        const category = await categoryFactory.create({
          name: 'Beauty',
          slug: 'beauty',
        });
        const service = await serviceFactory.create({
          partnerId: partner.id,
          categoryId: category.id,
          name: 'Haircut',
          priceAmount: 100000,
          durationMinutes: 30,
        });

        const response = await request(ctx.server)
          .post('/api/bookings')
          .set(authHelper.authHeader(customer))
          .send({
            partnerId: partner.id,
            locationId: location.id,
            scheduledDate: getTomorrowDate(),
            startTime: '10:00',
            services: [{ serviceId: service.id }],
            customerPhone: '0901234567',
            customerName: 'Test Customer',
          })
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(String),
          customerId: customer.user.id,
          partnerId: partner.id,
          locationId: location.id,
          status: 'pending',
        });
      });

      it('should create booking with multiple services', async () => {
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
        const category = await categoryFactory.create({
          name: 'Beauty',
          slug: 'beauty',
        });
        const service1 = await serviceFactory.create({
          partnerId: partner.id,
          categoryId: category.id,
          name: 'Haircut',
          priceAmount: 100000,
        });
        const service2 = await serviceFactory.create({
          partnerId: partner.id,
          categoryId: category.id,
          name: 'Hair Wash',
          priceAmount: 50000,
        });

        const response = await request(ctx.server)
          .post('/api/bookings')
          .set(authHelper.authHeader(customer))
          .send({
            partnerId: partner.id,
            locationId: location.id,
            scheduledDate: getTomorrowDate(),
            startTime: '10:00',
            services: [{ serviceId: service1.id }, { serviceId: service2.id }],
            customerPhone: '0901234567',
            customerName: 'Test Customer',
          })
          .expect(201);

        expect(response.body.totalAmount).toBe(150000);
      });

      it('should create booking with notes', async () => {
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
        const category = await categoryFactory.create({
          name: 'Beauty',
          slug: 'beauty',
        });
        const service = await serviceFactory.create({
          partnerId: partner.id,
          categoryId: category.id,
        });

        const response = await request(ctx.server)
          .post('/api/bookings')
          .set(authHelper.authHeader(customer))
          .send({
            partnerId: partner.id,
            locationId: location.id,
            scheduledDate: getTomorrowDate(),
            startTime: '14:00',
            services: [{ serviceId: service.id }],
            customerPhone: '0901234567',
            customerName: 'Test Customer',
            notes: 'Please prepare extra towels',
          })
          .expect(201);

        expect(response.body.notes).toBe('Please prepare extra towels');
      });

      it('should create home service booking', async () => {
        const customer = await authHelper.createAuthenticatedUser();

        const partnerUser = await authHelper.createAuthenticatedUser();
        const partner = await partnerFactory.createActive({
          userId: partnerUser.user.id,
          isHomeServiceEnabled: true,
        });
        await partnerStaffFactory.createOwner(
          partner.id,
          partnerUser.user.id,
          partnerUser.user.email,
        );

        const location = await locationFactory.create({
          partnerId: partner.id,
        });
        const category = await categoryFactory.create({
          name: 'Beauty',
          slug: 'beauty',
        });
        const service = await serviceFactory.create({
          partnerId: partner.id,
          categoryId: category.id,
        });

        const response = await request(ctx.server)
          .post('/api/bookings')
          .set(authHelper.authHeader(customer))
          .send({
            partnerId: partner.id,
            locationId: location.id,
            scheduledDate: getTomorrowDate(),
            startTime: '10:00',
            services: [{ serviceId: service.id }],
            customerPhone: '0901234567',
            customerName: 'Test Customer',
            isHomeService: true,
            customerAddress: '123 Customer Street, District 1',
          })
          .expect(201);

        expect(response.body.isHomeService).toBe(true);
        expect(response.body.customerAddress).toBe(
          '123 Customer Street, District 1',
        );
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for missing partnerId', async () => {
        const customer = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/bookings')
          .set(authHelper.authHeader(customer))
          .send({
            locationId: '00000000-0000-0000-0000-000000000000',
            scheduledDate: getTomorrowDate(),
            startTime: '10:00',
            services: [{ serviceId: '00000000-0000-0000-0000-000000000000' }],
            customerPhone: '0901234567',
            customerName: 'Test Customer',
          })
          .expect(400);
      });

      it('should return 400 for missing locationId', async () => {
        const customer = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/bookings')
          .set(authHelper.authHeader(customer))
          .send({
            partnerId: '00000000-0000-0000-0000-000000000000',
            scheduledDate: getTomorrowDate(),
            startTime: '10:00',
            services: [{ serviceId: '00000000-0000-0000-0000-000000000000' }],
            customerPhone: '0901234567',
            customerName: 'Test Customer',
          })
          .expect(400);
      });

      it('should return 400 for missing scheduledDate', async () => {
        const customer = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/bookings')
          .set(authHelper.authHeader(customer))
          .send({
            partnerId: '00000000-0000-0000-0000-000000000000',
            locationId: '00000000-0000-0000-0000-000000000000',
            startTime: '10:00',
            services: [{ serviceId: '00000000-0000-0000-0000-000000000000' }],
            customerPhone: '0901234567',
            customerName: 'Test Customer',
          })
          .expect(400);
      });

      it('should return 400 for missing startTime', async () => {
        const customer = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/bookings')
          .set(authHelper.authHeader(customer))
          .send({
            partnerId: '00000000-0000-0000-0000-000000000000',
            locationId: '00000000-0000-0000-0000-000000000000',
            scheduledDate: getTomorrowDate(),
            services: [{ serviceId: '00000000-0000-0000-0000-000000000000' }],
            customerPhone: '0901234567',
            customerName: 'Test Customer',
          })
          .expect(400);
      });

      it('should return 400 for empty services array', async () => {
        const customer = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/bookings')
          .set(authHelper.authHeader(customer))
          .send({
            partnerId: '00000000-0000-0000-0000-000000000000',
            locationId: '00000000-0000-0000-0000-000000000000',
            scheduledDate: getTomorrowDate(),
            startTime: '10:00',
            services: [],
            customerPhone: '0901234567',
            customerName: 'Test Customer',
          })
          .expect(400);
      });

      it('should return 400 for missing customerPhone', async () => {
        const customer = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/bookings')
          .set(authHelper.authHeader(customer))
          .send({
            partnerId: '00000000-0000-0000-0000-000000000000',
            locationId: '00000000-0000-0000-0000-000000000000',
            scheduledDate: getTomorrowDate(),
            startTime: '10:00',
            services: [{ serviceId: '00000000-0000-0000-0000-000000000000' }],
            customerName: 'Test Customer',
          })
          .expect(400);
      });

      it('should return 400 for missing customerName', async () => {
        const customer = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/bookings')
          .set(authHelper.authHeader(customer))
          .send({
            partnerId: '00000000-0000-0000-0000-000000000000',
            locationId: '00000000-0000-0000-0000-000000000000',
            scheduledDate: getTomorrowDate(),
            startTime: '10:00',
            services: [{ serviceId: '00000000-0000-0000-0000-000000000000' }],
            customerPhone: '0901234567',
          })
          .expect(400);
      });

      it('should return 400 for invalid UUID format', async () => {
        const customer = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/bookings')
          .set(authHelper.authHeader(customer))
          .send({
            partnerId: 'invalid-uuid',
            locationId: '00000000-0000-0000-0000-000000000000',
            scheduledDate: getTomorrowDate(),
            startTime: '10:00',
            services: [{ serviceId: '00000000-0000-0000-0000-000000000000' }],
            customerPhone: '0901234567',
            customerName: 'Test Customer',
          })
          .expect(400);
      });
    });

    describe('Not Found', () => {
      it('should return 404 if partner does not exist', async () => {
        const customer = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/bookings')
          .set(authHelper.authHeader(customer))
          .send({
            partnerId: '00000000-0000-0000-0000-000000000000',
            locationId: '00000000-0000-0000-0000-000000000000',
            scheduledDate: getTomorrowDate(),
            startTime: '10:00',
            services: [{ serviceId: '00000000-0000-0000-0000-000000000000' }],
            customerPhone: '0901234567',
            customerName: 'Test Customer',
          })
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .post('/api/bookings')
          .send({
            partnerId: '00000000-0000-0000-0000-000000000000',
            locationId: '00000000-0000-0000-0000-000000000000',
            scheduledDate: getTomorrowDate(),
            startTime: '10:00',
            services: [{ serviceId: '00000000-0000-0000-0000-000000000000' }],
            customerPhone: '0901234567',
            customerName: 'Test Customer',
          })
          .expect(401);
      });
    });
  });

  describe('GET /api/bookings/:id', () => {
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

  describe('GET /api/bookings/me', () => {
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

  describe('POST /api/bookings/:id/cancel', () => {
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

  describe('POST /api/partners/me/bookings/:id/confirm', () => {
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

  describe('POST /api/partners/me/bookings/:id/start', () => {
    describe('Happy Path', () => {
      it('should start confirmed booking', async () => {
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

        const response = await request(ctx.server)
          .post(`/api/partners/me/bookings/${booking.id}/start`)
          .set(authHelper.authHeader(partnerUser))
          .expect(200);

        expect(response.body.status).toBe(BookingStatusEnum.IN_PROGRESS);
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
          .post('/api/partners/me/bookings/invalid-uuid/start')
          .set(authHelper.authHeader(partnerUser))
          .expect(400);
      });
    });

    describe('Conflict', () => {
      it('should return 409 for pending booking', async () => {
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

        await request(ctx.server)
          .post(`/api/partners/me/bookings/${booking.id}/start`)
          .set(authHelper.authHeader(partnerUser))
          .expect(409);
      });

      it('should return 409 for already in-progress booking', async () => {
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
          status: BookingStatusEnum.IN_PROGRESS,
        });

        await request(ctx.server)
          .post(`/api/partners/me/bookings/${booking.id}/start`)
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
          .post(`/api/partners/me/bookings/${booking.id}/start`)
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
          .post(`/api/partners/me/bookings/${booking.id}/start`)
          .set(authHelper.authHeader(partnerUser))
          .expect(409);
      });
    });

    describe('Not Found', () => {
      it('should return 404 if user has no partner profile', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post(
            '/api/partners/me/bookings/00000000-0000-0000-0000-000000000000/start',
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
            '/api/partners/me/bookings/00000000-0000-0000-0000-000000000000/start',
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
        const booking = await bookingFactory.createConfirmed({
          customerId: customer.user.id,
          partnerId: partner2.id,
          locationId: location2.id,
        });

        await request(ctx.server)
          .post(`/api/partners/me/bookings/${booking.id}/start`)
          .set(authHelper.authHeader(partnerUser1))
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .post(
            '/api/partners/me/bookings/00000000-0000-0000-0000-000000000000/start',
          )
          .expect(401);
      });
    });
  });

  describe('POST /api/partners/me/bookings/:id/complete', () => {
    describe('Happy Path', () => {
      it('should complete in-progress booking', async () => {
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
          status: BookingStatusEnum.IN_PROGRESS,
        });

        const response = await request(ctx.server)
          .post(`/api/partners/me/bookings/${booking.id}/complete`)
          .set(authHelper.authHeader(partnerUser))
          .expect(200);

        expect(response.body.status).toBe(BookingStatusEnum.COMPLETED);
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
          .post('/api/partners/me/bookings/invalid-uuid/complete')
          .set(authHelper.authHeader(partnerUser))
          .expect(400);
      });
    });

    describe('Conflict', () => {
      it('should return 409 for pending booking', async () => {
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

        await request(ctx.server)
          .post(`/api/partners/me/bookings/${booking.id}/complete`)
          .set(authHelper.authHeader(partnerUser))
          .expect(409);
      });

      it('should return 409 for confirmed booking (not started)', async () => {
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
          .post(`/api/partners/me/bookings/${booking.id}/complete`)
          .set(authHelper.authHeader(partnerUser))
          .expect(409);
      });

      it('should return 409 for already completed booking', async () => {
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
          .post(`/api/partners/me/bookings/${booking.id}/complete`)
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
          .post(`/api/partners/me/bookings/${booking.id}/complete`)
          .set(authHelper.authHeader(partnerUser))
          .expect(409);
      });
    });

    describe('Not Found', () => {
      it('should return 404 if user has no partner profile', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post(
            '/api/partners/me/bookings/00000000-0000-0000-0000-000000000000/complete',
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
            '/api/partners/me/bookings/00000000-0000-0000-0000-000000000000/complete',
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
          status: BookingStatusEnum.IN_PROGRESS,
        });

        await request(ctx.server)
          .post(`/api/partners/me/bookings/${booking.id}/complete`)
          .set(authHelper.authHeader(partnerUser1))
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .post(
            '/api/partners/me/bookings/00000000-0000-0000-0000-000000000000/complete',
          )
          .expect(401);
      });
    });
  });

  describe('POST /api/partners/me/bookings/:id/cancel', () => {
    describe('Happy Path', () => {
      it('should cancel pending booking as partner', async () => {
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
          .post(`/api/partners/me/bookings/${booking.id}/cancel`)
          .set(authHelper.authHeader(partnerUser))
          .send({
            reason: 'Staff unavailable',
          })
          .expect(200);

        expect(response.body.status).toBe(BookingStatusEnum.CANCELLED);
      });

      it('should cancel confirmed booking as partner', async () => {
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

        const response = await request(ctx.server)
          .post(`/api/partners/me/bookings/${booking.id}/cancel`)
          .set(authHelper.authHeader(partnerUser))
          .send({
            reason: 'Emergency closure',
          })
          .expect(200);

        expect(response.body.status).toBe(BookingStatusEnum.CANCELLED);
      });

      it('should cancel without reason', async () => {
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
        });

        const response = await request(ctx.server)
          .post(`/api/partners/me/bookings/${booking.id}/cancel`)
          .set(authHelper.authHeader(partnerUser))
          .send({})
          .expect(200);

        expect(response.body.status).toBe(BookingStatusEnum.CANCELLED);
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
          .post('/api/partners/me/bookings/invalid-uuid/cancel')
          .set(authHelper.authHeader(partnerUser))
          .send({})
          .expect(400);
      });
    });

    describe('Conflict', () => {
      it('should return 409 for already cancelled booking', async () => {
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
          .post(`/api/partners/me/bookings/${booking.id}/cancel`)
          .set(authHelper.authHeader(partnerUser))
          .send({})
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
          .post(`/api/partners/me/bookings/${booking.id}/cancel`)
          .set(authHelper.authHeader(partnerUser))
          .send({})
          .expect(409);
      });

      it('should return 409 for in-progress booking', async () => {
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
          status: BookingStatusEnum.IN_PROGRESS,
        });

        await request(ctx.server)
          .post(`/api/partners/me/bookings/${booking.id}/cancel`)
          .set(authHelper.authHeader(partnerUser))
          .send({})
          .expect(409);
      });
    });

    describe('Not Found', () => {
      it('should return 404 if user has no partner profile', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post(
            '/api/partners/me/bookings/00000000-0000-0000-0000-000000000000/cancel',
          )
          .set(authHelper.authHeader(user))
          .send({})
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
            '/api/partners/me/bookings/00000000-0000-0000-0000-000000000000/cancel',
          )
          .set(authHelper.authHeader(partnerUser))
          .send({})
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

        await request(ctx.server)
          .post(`/api/partners/me/bookings/${booking.id}/cancel`)
          .set(authHelper.authHeader(partnerUser1))
          .send({})
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .post(
            '/api/partners/me/bookings/00000000-0000-0000-0000-000000000000/cancel',
          )
          .send({})
          .expect(401);
      });
    });
  });

  describe('GET /api/partners/me/bookings', () => {
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
});
