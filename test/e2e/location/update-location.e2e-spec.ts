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

describe('PUT /api/partners/me/locations/:id', () => {
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
    it('should update location name', async () => {
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
        name: 'Original Name',
      });

      const response = await request(ctx.server)
        .put(`/api/partners/me/locations/${location.id}`)
        .set(authHelper.authHeader(user))
        .send({
          name: 'Updated Name',
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
    });

    it('should update location address', async () => {
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
        .put(`/api/partners/me/locations/${location.id}`)
        .set(authHelper.authHeader(user))
        .send({
          street: 'New Street 456',
          ward: 'Ward 10',
          district: 'District 5',
          city: 'Da Nang',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        street: 'New Street 456',
        ward: 'Ward 10',
        district: 'District 5',
        city: 'Da Nang',
      });
    });

    it('should update location coordinates', async () => {
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
        .put(`/api/partners/me/locations/${location.id}`)
        .set(authHelper.authHeader(user))
        .send({
          latitude: 16.054407,
          longitude: 108.202164,
        })
        .expect(200);

      expect(response.body.latitude).toBe(16.054407);
      expect(response.body.longitude).toBe(108.202164);
    });

    it('should update location phone', async () => {
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
        .put(`/api/partners/me/locations/${location.id}`)
        .set(authHelper.authHeader(user))
        .send({
          phone: '0909999999',
        })
        .expect(200);

      expect(response.body.phone).toBe('0909999999');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid latitude', async () => {
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
        .put(`/api/partners/me/locations/${location.id}`)
        .set(authHelper.authHeader(user))
        .send({
          latitude: 200,
        })
        .expect(400);
    });

    it('should return 400 for invalid longitude', async () => {
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
        .put(`/api/partners/me/locations/${location.id}`)
        .set(authHelper.authHeader(user))
        .send({
          longitude: 200,
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
        .put('/api/partners/me/locations/invalid-uuid')
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
        .put('/api/partners/me/locations/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Updated Name',
        })
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
        .put('/api/partners/me/locations/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Updated Name',
        })
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
        .put(`/api/partners/me/locations/${location.id}`)
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
        .put('/api/partners/me/locations/00000000-0000-0000-0000-000000000000')
        .send({
          name: 'Updated Name',
        })
        .expect(401);
    });
  });
});
