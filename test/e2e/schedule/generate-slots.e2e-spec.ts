import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { PartnerFactory } from '../../support/factories/partner.factory';
import { LocationFactory } from '../../support/factories/location.factory';
import { PartnerStaffFactory } from '../../support/factories/partner-staff.factory';

describe('POST /api/partners/me/locations/:locationId/slots/generate', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let partnerFactory: PartnerFactory;
  let locationFactory: LocationFactory;
  let partnerStaffFactory: PartnerStaffFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    partnerFactory = new PartnerFactory(ctx.db);
    locationFactory = new LocationFactory(ctx.db);
    partnerStaffFactory = new PartnerStaffFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanAllData();
  });

  const getDateRange = () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  describe('Happy Path', () => {
    it('should generate slots for date range', async () => {
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

      const { startDate, endDate } = getDateRange();

      const response = await request(ctx.server)
        .post(`/api/partners/me/locations/${location.id}/slots/generate`)
        .set(authHelper.authHeader(partnerUser))
        .send({
          startDate,
          endDate,
          slotDurationMinutes: 30,
        })
        .expect(201);

      expect(response.body).toHaveProperty('count');
      expect(typeof response.body.count).toBe('number');
    });

    it('should generate slots with custom duration', async () => {
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

      const { startDate, endDate } = getDateRange();

      const response = await request(ctx.server)
        .post(`/api/partners/me/locations/${location.id}/slots/generate`)
        .set(authHelper.authHeader(partnerUser))
        .send({
          startDate,
          endDate,
          slotDurationMinutes: 60,
        })
        .expect(201);

      expect(response.body).toHaveProperty('count');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid locationId', async () => {
      const partnerUser = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: partnerUser.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        partnerUser.user.id,
        partnerUser.user.email,
      );

      const { startDate, endDate } = getDateRange();

      await request(ctx.server)
        .post('/api/partners/me/locations/invalid-uuid/slots/generate')
        .set(authHelper.authHeader(partnerUser))
        .send({
          startDate,
          endDate,
          slotDurationMinutes: 30,
        })
        .expect(400);
    });

    it('should return 400 for missing startDate', async () => {
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

      const { endDate } = getDateRange();

      await request(ctx.server)
        .post(`/api/partners/me/locations/${location.id}/slots/generate`)
        .set(authHelper.authHeader(partnerUser))
        .send({
          endDate,
          slotDurationMinutes: 30,
        })
        .expect(400);
    });

    it('should return 400 for missing endDate', async () => {
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

      const { startDate } = getDateRange();

      await request(ctx.server)
        .post(`/api/partners/me/locations/${location.id}/slots/generate`)
        .set(authHelper.authHeader(partnerUser))
        .send({
          startDate,
          slotDurationMinutes: 30,
        })
        .expect(400);
    });

    it('should return 400 for missing slotDurationMinutes', async () => {
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

      const { startDate, endDate } = getDateRange();

      await request(ctx.server)
        .post(`/api/partners/me/locations/${location.id}/slots/generate`)
        .set(authHelper.authHeader(partnerUser))
        .send({
          startDate,
          endDate,
        })
        .expect(400);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if user has no partner profile', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const { startDate, endDate } = getDateRange();

      await request(ctx.server)
        .post(
          '/api/partners/me/locations/00000000-0000-0000-0000-000000000000/slots/generate',
        )
        .set(authHelper.authHeader(user))
        .send({
          startDate,
          endDate,
          slotDurationMinutes: 30,
        })
        .expect(404);
    });

    it('should return 404 if location does not exist', async () => {
      const partnerUser = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: partnerUser.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        partnerUser.user.id,
        partnerUser.user.email,
      );

      const { startDate, endDate } = getDateRange();

      await request(ctx.server)
        .post(
          '/api/partners/me/locations/00000000-0000-0000-0000-000000000000/slots/generate',
        )
        .set(authHelper.authHeader(partnerUser))
        .send({
          startDate,
          endDate,
          slotDurationMinutes: 30,
        })
        .expect(404);
    });

    it('should return 404 if location belongs to another partner', async () => {
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

      const { startDate, endDate } = getDateRange();

      await request(ctx.server)
        .post(`/api/partners/me/locations/${location2.id}/slots/generate`)
        .set(authHelper.authHeader(partnerUser1))
        .send({
          startDate,
          endDate,
          slotDurationMinutes: 30,
        })
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      const { startDate, endDate } = getDateRange();

      await request(ctx.server)
        .post(
          '/api/partners/me/locations/00000000-0000-0000-0000-000000000000/slots/generate',
        )
        .send({
          startDate,
          endDate,
          slotDurationMinutes: 30,
        })
        .expect(401);
    });
  });
});
