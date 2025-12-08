import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { PartnerFactory } from '../../support/factories/partner.factory';
import { LocationFactory } from '../../support/factories/location.factory';
import { CategoryFactory } from '../../support/factories/category.factory';
import { ServiceFactory } from '../../support/factories/service.factory';
import { PartnerStaffFactory } from '../../support/factories/partner-staff.factory';

describe('POST /api/bookings', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let partnerFactory: PartnerFactory;
  let locationFactory: LocationFactory;
  let categoryFactory: CategoryFactory;
  let serviceFactory: ServiceFactory;
  let partnerStaffFactory: PartnerStaffFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    partnerFactory = new PartnerFactory(ctx.db);
    locationFactory = new LocationFactory(ctx.db);
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

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

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
