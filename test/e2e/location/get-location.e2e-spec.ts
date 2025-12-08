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

describe('GET /api/locations/:id', () => {
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
    it('should get location by id (public endpoint)', async () => {
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
        name: 'Test Location',
        street: '123 Test Street',
        district: 'District 1',
        city: 'Ho Chi Minh City',
      });

      // Should work without authentication (public endpoint)
      const response = await request(ctx.server)
        .get(`/api/locations/${location.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: location.id,
        name: 'Test Location',
        street: '123 Test Street',
        district: 'District 1',
        city: 'Ho Chi Minh City',
      });
    });

    it('should get location with all fields', async () => {
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
        name: 'Full Location',
        street: '456 Full Street',
        ward: 'Ward 5',
        district: 'District 3',
        city: 'Ho Chi Minh City',
        latitude: 10.762622,
        longitude: 106.660172,
        phone: '0901234567',
        isPrimary: true,
      });

      const response = await request(ctx.server)
        .get(`/api/locations/${location.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: location.id,
        name: 'Full Location',
        street: '456 Full Street',
        ward: 'Ward 5',
        district: 'District 3',
        city: 'Ho Chi Minh City',
        isPrimary: true,
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
      const location = await locationFactory.create({
        partnerId: partner.id,
      });

      const response = await request(ctx.server)
        .get(`/api/locations/${location.id}`)
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body.id).toBe(location.id);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid UUID', async () => {
      await request(ctx.server).get('/api/locations/invalid-uuid').expect(400);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if location does not exist', async () => {
      await request(ctx.server)
        .get('/api/locations/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
