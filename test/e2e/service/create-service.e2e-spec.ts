import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { PartnerFactory } from '../../support/factories/partner.factory';
import { CategoryFactory } from '../../support/factories/category.factory';
import { PartnerStaffFactory } from '../../support/factories/partner-staff.factory';
import { BookingTypeEnum } from '../../../src/core/domain/service/value-objects/booking-type.vo';

describe('POST /api/partners/me/services', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let partnerFactory: PartnerFactory;
  let categoryFactory: CategoryFactory;
  let partnerStaffFactory: PartnerStaffFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    partnerFactory = new PartnerFactory(ctx.db);
    categoryFactory = new CategoryFactory(ctx.db);
    partnerStaffFactory = new PartnerStaffFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanAllData();
  });

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
