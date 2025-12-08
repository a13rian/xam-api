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

describe('GET /api/partners/me/locations', () => {
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
    it('should list all locations for partner', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );

      await locationFactory.create({
        partnerId: partner.id,
        name: 'Location 1',
      });
      await locationFactory.create({
        partnerId: partner.id,
        name: 'Location 2',
      });
      await locationFactory.create({
        partnerId: partner.id,
        name: 'Location 3',
      });

      const response = await request(ctx.server)
        .get('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body.items).toHaveLength(3);
      expect(response.body.total).toBe(3);
    });

    it('should return empty list when partner has no locations', async () => {
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
        .get('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should not include locations from other partners', async () => {
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

      await locationFactory.create({
        partnerId: partner1.id,
        name: 'Partner 1 Location',
      });
      await locationFactory.create({
        partnerId: partner2.id,
        name: 'Partner 2 Location',
      });

      const response = await request(ctx.server)
        .get('/api/partners/me/locations')
        .set(authHelper.authHeader(user1))
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('Partner 1 Location');
    });
  });

  describe('Not Found', () => {
    it('should return 404 if user has no partner profile', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .get('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server).get('/api/partners/me/locations').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(ctx.server)
        .get('/api/partners/me/locations')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
