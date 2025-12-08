import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { PartnerFactory } from '../../support/factories/partner.factory';
import { PartnerStaffFactory } from '../../support/factories/partner-staff.factory';
import { PartnerStatusEnum } from '../../../src/core/domain/partner/value-objects/partner-status.vo';

describe('POST /api/partners/me/locations', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let partnerFactory: PartnerFactory;
  let partnerStaffFactory: PartnerStaffFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    partnerFactory = new PartnerFactory(ctx.db);
    partnerStaffFactory = new PartnerStaffFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanAllData();
  });

  describe('Happy Path', () => {
    it('should create location for active partner', async () => {
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
        .post('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Main Location',
          street: '123 Test Street',
          district: 'District 1',
          city: 'Ho Chi Minh City',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'Main Location',
        street: '123 Test Street',
        district: 'District 1',
        city: 'Ho Chi Minh City',
        isActive: true,
      });
    });

    it('should create location with all optional fields', async () => {
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
        .post('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Full Location',
          street: '456 Full Street',
          ward: 'Ward 5',
          district: 'District 3',
          city: 'Ho Chi Minh City',
          latitude: 10.762622,
          longitude: 106.660172,
          phone: '0901234567',
          isPrimary: true,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Full Location',
        ward: 'Ward 5',
        latitude: 10.762622,
        longitude: 106.660172,
        phone: '0901234567',
        isPrimary: true,
      });
    });

    it('should create location as primary', async () => {
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
        .post('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Primary Location',
          street: '789 Primary Street',
          district: 'District 7',
          city: 'Ho Chi Minh City',
          isPrimary: true,
        })
        .expect(201);

      expect(response.body.isPrimary).toBe(true);
    });
  });

  describe('Validation Errors', () => {
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

      await request(ctx.server)
        .post('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .send({
          street: '123 Test Street',
          district: 'District 1',
          city: 'Ho Chi Minh City',
        })
        .expect(400);
    });

    it('should return 400 for missing street', async () => {
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
        .post('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Test Location',
          district: 'District 1',
          city: 'Ho Chi Minh City',
        })
        .expect(400);
    });

    it('should return 400 for missing district', async () => {
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
        .post('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Test Location',
          street: '123 Test Street',
          city: 'Ho Chi Minh City',
        })
        .expect(400);
    });

    it('should return 400 for missing city', async () => {
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
        .post('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Test Location',
          street: '123 Test Street',
          district: 'District 1',
        })
        .expect(400);
    });

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

      await request(ctx.server)
        .post('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Test Location',
          street: '123 Test Street',
          district: 'District 1',
          city: 'Ho Chi Minh City',
          latitude: 200, // Invalid latitude
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

      await request(ctx.server)
        .post('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Test Location',
          street: '123 Test Street',
          district: 'District 1',
          city: 'Ho Chi Minh City',
          longitude: 200, // Invalid longitude
        })
        .expect(400);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if user has no partner profile', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .post('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Test Location',
          street: '123 Test Street',
          district: 'District 1',
          city: 'Ho Chi Minh City',
        })
        .expect(404);
    });

    it('should return 404 if partner is pending', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.create({
        userId: user.user.id,
        status: PartnerStatusEnum.PENDING,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );

      await request(ctx.server)
        .post('/api/partners/me/locations')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Test Location',
          street: '123 Test Street',
          district: 'District 1',
          city: 'Ho Chi Minh City',
        })
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server)
        .post('/api/partners/me/locations')
        .send({
          name: 'Test Location',
          street: '123 Test Street',
          district: 'District 1',
          city: 'Ho Chi Minh City',
        })
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(ctx.server)
        .post('/api/partners/me/locations')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          name: 'Test Location',
          street: '123 Test Street',
          district: 'District 1',
          city: 'Ho Chi Minh City',
        })
        .expect(401);
    });
  });
});
