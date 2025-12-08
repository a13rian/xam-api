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

describe('DELETE /api/partners/me/locations/:id', () => {
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

  describe('Happy Path', () => {
    it('should delete location', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );
      const location = await locationFactory.create({
        partnerId: partner.id,
      });

      await request(ctx.server)
        .delete(`/api/partners/me/locations/${location.id}`)
        .set(authHelper.authHeader(user))
        .expect(200);

      // Verify location is deleted
      const listResponse = await request(ctx.server)
        .get('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(listResponse.body.items).toHaveLength(0);
    });

    it('should delete non-primary location when there are multiple', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );

      await locationFactory.createPrimary({
        partnerId: partner.id,
        name: 'Primary Location',
      });
      const nonPrimary = await locationFactory.create({
        partnerId: partner.id,
        name: 'Non-Primary Location',
      });

      await request(ctx.server)
        .delete(`/api/partners/me/locations/${nonPrimary.id}`)
        .set(authHelper.authHeader(user))
        .expect(200);

      const listResponse = await request(ctx.server)
        .get('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(listResponse.body.items).toHaveLength(1);
      expect(listResponse.body.items[0].name).toBe('Primary Location');
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
        .delete('/api/partners/me/locations/invalid-uuid')
        .set(authHelper.authHeader(user))
        .expect(400);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if user has no partner profile', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .delete(
          '/api/partners/me/locations/00000000-0000-0000-0000-000000000000',
        )
        .set(authHelper.authHeader(user))
        .expect(404);
    });

    it('should return 404 if location does not exist', async () => {
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
          '/api/partners/me/locations/00000000-0000-0000-0000-000000000000',
        )
        .set(authHelper.authHeader(user))
        .expect(404);
    });

    it('should return 404 if location belongs to another partner', async () => {
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

      const location = await locationFactory.create({
        partnerId: partner2.id,
      });

      await request(ctx.server)
        .delete(`/api/partners/me/locations/${location.id}`)
        .set(authHelper.authHeader(user1))
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server)
        .delete(
          '/api/partners/me/locations/00000000-0000-0000-0000-000000000000',
        )
        .expect(401);
    });
  });
});
