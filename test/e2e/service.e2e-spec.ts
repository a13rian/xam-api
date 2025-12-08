/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AuthHelper } from '../support/auth/auth.helper';
import { PartnerFactory } from '../support/factories/partner.factory';
import { CategoryFactory } from '../support/factories/category.factory';
import { ServiceFactory } from '../support/factories/service.factory';
import { PartnerStaffFactory } from '../support/factories/partner-staff.factory';
import { BookingTypeEnum } from '../../src/core/domain/service/value-objects/booking-type.vo';

describe('Service E2E', () => {
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

  describe('POST /api/partners/me/services', () => {
    describe('Happy Path', () => {
      it('should create service with required fields', async () => {
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

        const response = await request(ctx.server)
          .post('/api/partners/me/services')
          .set(authHelper.authHeader(user))
          .send({
            categoryId: category.id,
            name: 'Haircut',
            price: 150000,
            durationMinutes: 30,
            bookingType: BookingTypeEnum.TIME_SLOT,
          })
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(String),
          name: 'Haircut',
          price: 150000,
          durationMinutes: 30,
          isActive: true,
        });
      });

      it('should create service with all optional fields', async () => {
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

        const response = await request(ctx.server)
          .post('/api/partners/me/services')
          .set(authHelper.authHeader(user))
          .send({
            categoryId: category.id,
            name: 'Full Body Massage',
            description: 'Relaxing full body massage with essential oils',
            price: 500000,
            currency: 'VND',
            durationMinutes: 90,
            bookingType: BookingTypeEnum.TIME_SLOT,
            sortOrder: 1,
          })
          .expect(201);

        expect(response.body).toMatchObject({
          name: 'Full Body Massage',
          description: 'Relaxing full body massage with essential oils',
          price: 500000,
          durationMinutes: 90,
        });
      });

      it('should create service with walk-in booking type', async () => {
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
          name: 'Nails',
          slug: 'nails',
        });

        const response = await request(ctx.server)
          .post('/api/partners/me/services')
          .set(authHelper.authHeader(user))
          .send({
            categoryId: category.id,
            name: 'Manicure',
            price: 100000,
            durationMinutes: 45,
            bookingType: BookingTypeEnum.WALK_IN,
          })
          .expect(201);

        expect(response.body.bookingType).toBe(BookingTypeEnum.WALK_IN);
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for missing categoryId', async () => {
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
          .post('/api/partners/me/services')
          .set(authHelper.authHeader(user))
          .send({
            name: 'Test Service',
            price: 100000,
            durationMinutes: 30,
            bookingType: BookingTypeEnum.TIME_SLOT,
          })
          .expect(400);
      });

      it('should return 400 for missing name', async () => {
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

        await request(ctx.server)
          .post('/api/partners/me/services')
          .set(authHelper.authHeader(user))
          .send({
            categoryId: category.id,
            price: 100000,
            durationMinutes: 30,
            bookingType: BookingTypeEnum.TIME_SLOT,
          })
          .expect(400);
      });

      it('should return 400 for missing price', async () => {
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

        await request(ctx.server)
          .post('/api/partners/me/services')
          .set(authHelper.authHeader(user))
          .send({
            categoryId: category.id,
            name: 'Test Service',
            durationMinutes: 30,
            bookingType: BookingTypeEnum.TIME_SLOT,
          })
          .expect(400);
      });

      it('should return 400 for negative price', async () => {
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

        await request(ctx.server)
          .post('/api/partners/me/services')
          .set(authHelper.authHeader(user))
          .send({
            categoryId: category.id,
            name: 'Test Service',
            price: -100,
            durationMinutes: 30,
            bookingType: BookingTypeEnum.TIME_SLOT,
          })
          .expect(400);
      });

      it('should return 400 for missing durationMinutes', async () => {
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

        await request(ctx.server)
          .post('/api/partners/me/services')
          .set(authHelper.authHeader(user))
          .send({
            categoryId: category.id,
            name: 'Test Service',
            price: 100000,
            bookingType: BookingTypeEnum.TIME_SLOT,
          })
          .expect(400);
      });

      it('should return 400 for invalid durationMinutes', async () => {
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

        await request(ctx.server)
          .post('/api/partners/me/services')
          .set(authHelper.authHeader(user))
          .send({
            categoryId: category.id,
            name: 'Test Service',
            price: 100000,
            durationMinutes: 0,
            bookingType: BookingTypeEnum.TIME_SLOT,
          })
          .expect(400);
      });

      it('should return 400 for invalid bookingType', async () => {
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

        await request(ctx.server)
          .post('/api/partners/me/services')
          .set(authHelper.authHeader(user))
          .send({
            categoryId: category.id,
            name: 'Test Service',
            price: 100000,
            durationMinutes: 30,
            bookingType: 'invalid_type',
          })
          .expect(400);
      });

      it('should return 400 for invalid categoryId format', async () => {
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
          .post('/api/partners/me/services')
          .set(authHelper.authHeader(user))
          .send({
            categoryId: 'invalid-uuid',
            name: 'Test Service',
            price: 100000,
            durationMinutes: 30,
            bookingType: BookingTypeEnum.TIME_SLOT,
          })
          .expect(400);
      });
    });

    describe('Not Found', () => {
      it('should return 404 if user has no partner profile', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/partners/me/services')
          .set(authHelper.authHeader(user))
          .send({
            categoryId: '00000000-0000-0000-0000-000000000000',
            name: 'Test Service',
            price: 100000,
            durationMinutes: 30,
            bookingType: BookingTypeEnum.TIME_SLOT,
          })
          .expect(404);
      });

      it('should return 404 if category does not exist', async () => {
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
          .post('/api/partners/me/services')
          .set(authHelper.authHeader(user))
          .send({
            categoryId: '00000000-0000-0000-0000-000000000000',
            name: 'Test Service',
            price: 100000,
            durationMinutes: 30,
            bookingType: BookingTypeEnum.TIME_SLOT,
          })
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .post('/api/partners/me/services')
          .send({
            categoryId: '00000000-0000-0000-0000-000000000000',
            name: 'Test Service',
            price: 100000,
            durationMinutes: 30,
            bookingType: BookingTypeEnum.TIME_SLOT,
          })
          .expect(401);
      });

      it('should return 401 with invalid token', async () => {
        await request(ctx.server)
          .post('/api/partners/me/services')
          .set('Authorization', 'Bearer invalid-token')
          .send({
            categoryId: '00000000-0000-0000-0000-000000000000',
            name: 'Test Service',
            price: 100000,
            durationMinutes: 30,
            bookingType: BookingTypeEnum.TIME_SLOT,
          })
          .expect(401);
      });
    });
  });

  describe('GET /api/partners/me/services', () => {
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

  describe('GET /api/services/:id', () => {
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

  describe('GET /api/services', () => {
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

  describe('PUT /api/partners/me/services/:id', () => {
    describe('Happy Path', () => {
      it('should update service name', async () => {
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
          name: 'Original Name',
        });

        const response = await request(ctx.server)
          .put(`/api/partners/me/services/${service.id}`)
          .set(authHelper.authHeader(user))
          .send({
            name: 'Updated Name',
          })
          .expect(200);

        expect(response.body.name).toBe('Updated Name');
      });

      it('should update service price', async () => {
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
          priceAmount: 100000,
        });

        const response = await request(ctx.server)
          .put(`/api/partners/me/services/${service.id}`)
          .set(authHelper.authHeader(user))
          .send({
            price: 200000,
          })
          .expect(200);

        expect(response.body.price).toBe(200000);
      });

      it('should update service description', async () => {
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
          .put(`/api/partners/me/services/${service.id}`)
          .set(authHelper.authHeader(user))
          .send({
            description: 'New detailed description',
          })
          .expect(200);

        expect(response.body.description).toBe('New detailed description');
      });

      it('should update service duration', async () => {
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
          durationMinutes: 30,
        });

        const response = await request(ctx.server)
          .put(`/api/partners/me/services/${service.id}`)
          .set(authHelper.authHeader(user))
          .send({
            durationMinutes: 60,
          })
          .expect(200);

        expect(response.body.durationMinutes).toBe(60);
      });

      it('should update service category', async () => {
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
        const service = await serviceFactory.create({
          partnerId: partner.id,
          categoryId: category1.id,
        });

        const response = await request(ctx.server)
          .put(`/api/partners/me/services/${service.id}`)
          .set(authHelper.authHeader(user))
          .send({
            categoryId: category2.id,
          })
          .expect(200);

        expect(response.body.categoryId).toBe(category2.id);
      });

      it('should update multiple fields at once', async () => {
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
          .put(`/api/partners/me/services/${service.id}`)
          .set(authHelper.authHeader(user))
          .send({
            name: 'Premium Haircut',
            price: 300000,
            durationMinutes: 45,
            description: 'Premium haircut service',
          })
          .expect(200);

        expect(response.body).toMatchObject({
          name: 'Premium Haircut',
          price: 300000,
          durationMinutes: 45,
          description: 'Premium haircut service',
        });
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for negative price', async () => {
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
          .put(`/api/partners/me/services/${service.id}`)
          .set(authHelper.authHeader(user))
          .send({
            price: -100,
          })
          .expect(400);
      });

      it('should return 400 for invalid duration', async () => {
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
          .put(`/api/partners/me/services/${service.id}`)
          .set(authHelper.authHeader(user))
          .send({
            durationMinutes: 0,
          })
          .expect(400);
      });

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
          .put('/api/partners/me/services/invalid-uuid')
          .set(authHelper.authHeader(user))
          .send({
            name: 'Updated Name',
          })
          .expect(400);
      });
    });

    describe('Not Found', () => {
      it('should return 404 if user has no partner profile', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .put('/api/partners/me/services/00000000-0000-0000-0000-000000000000')
          .set(authHelper.authHeader(user))
          .send({
            name: 'Updated Name',
          })
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
          .put('/api/partners/me/services/00000000-0000-0000-0000-000000000000')
          .set(authHelper.authHeader(user))
          .send({
            name: 'Updated Name',
          })
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
          .put(`/api/partners/me/services/${service.id}`)
          .set(authHelper.authHeader(user1))
          .send({
            name: 'Updated Name',
          })
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .put('/api/partners/me/services/00000000-0000-0000-0000-000000000000')
          .send({
            name: 'Updated Name',
          })
          .expect(401);
      });
    });
  });

  describe('DELETE /api/partners/me/services/:id', () => {
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
});
