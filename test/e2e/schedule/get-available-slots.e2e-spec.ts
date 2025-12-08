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

describe('GET /api/locations/:locationId/slots/available', () => {
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

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  describe('Happy Path', () => {
    it('should get available slots for date (public endpoint)', async () => {
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

      // This is a public endpoint, should work without authentication
      const response = await request(ctx.server)
        .get(`/api/locations/${location.id}/slots/available`)
        .query({ date: getTomorrowDate() })
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should work with authenticated user too', async () => {
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

      const response = await request(ctx.server)
        .get(`/api/locations/${location.id}/slots/available`)
        .query({ date: getTomorrowDate() })
        .set(authHelper.authHeader(customer))
        .expect(200);

      expect(response.body).toHaveProperty('items');
    });

    it('should return empty list when no slots available', async () => {
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

      const response = await request(ctx.server)
        .get(`/api/locations/${location.id}/slots/available`)
        .query({ date: getTomorrowDate() })
        .expect(200);

      expect(response.body.items).toHaveLength(0);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid locationId', async () => {
      await request(ctx.server)
        .get('/api/locations/invalid-uuid/slots/available')
        .query({ date: getTomorrowDate() })
        .expect(400);
    });

    it('should return 400 for missing date', async () => {
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

      await request(ctx.server)
        .get(`/api/locations/${location.id}/slots/available`)
        .expect(400);
    });

    it('should return 400 for invalid date format', async () => {
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

      await request(ctx.server)
        .get(`/api/locations/${location.id}/slots/available`)
        .query({ date: 'invalid-date' })
        .expect(400);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if location does not exist', async () => {
      await request(ctx.server)
        .get(
          '/api/locations/00000000-0000-0000-0000-000000000000/slots/available',
        )
        .query({ date: getTomorrowDate() })
        .expect(404);
    });
  });
});
