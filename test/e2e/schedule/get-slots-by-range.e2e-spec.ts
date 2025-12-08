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

describe('GET /api/partners/me/locations/:locationId/slots', () => {
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
    it('should get slots by date range', async () => {
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
        .get(`/api/partners/me/locations/${location.id}/slots`)
        .query({ startDate, endDate })
        .set(authHelper.authHeader(partnerUser))
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should return empty list when no slots exist', async () => {
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
        .get(`/api/partners/me/locations/${location.id}/slots`)
        .query({ startDate, endDate })
        .set(authHelper.authHeader(partnerUser))
        .expect(200);

      expect(response.body.items).toHaveLength(0);
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
        .get('/api/partners/me/locations/invalid-uuid/slots')
        .query({ startDate, endDate })
        .set(authHelper.authHeader(partnerUser))
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
        .get(`/api/partners/me/locations/${location.id}/slots`)
        .query({ endDate })
        .set(authHelper.authHeader(partnerUser))
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
        .get(`/api/partners/me/locations/${location.id}/slots`)
        .query({ startDate })
        .set(authHelper.authHeader(partnerUser))
        .expect(400);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if user has no partner profile', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const { startDate, endDate } = getDateRange();

      await request(ctx.server)
        .get(
          '/api/partners/me/locations/00000000-0000-0000-0000-000000000000/slots',
        )
        .query({ startDate, endDate })
        .set(authHelper.authHeader(user))
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      const { startDate, endDate } = getDateRange();

      await request(ctx.server)
        .get(
          '/api/partners/me/locations/00000000-0000-0000-0000-000000000000/slots',
        )
        .query({ startDate, endDate })
        .expect(401);
    });
  });
});
