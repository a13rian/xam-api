/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AuthHelper } from '../support/auth/auth.helper';
import { PartnerFactory } from '../support/factories/partner.factory';
import { LocationFactory } from '../support/factories/location.factory';
import { PartnerStaffFactory } from '../support/factories/partner-staff.factory';
import { PartnerStatusEnum } from '../../src/core/domain/partner/value-objects/partner-status.vo';

describe('Location E2E', () => {
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

  describe('POST /api/partners/me/locations', () => {
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

  describe('GET /api/partners/me/locations', () => {
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

  describe('GET /api/locations/:id', () => {
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
        await request(ctx.server)
          .get('/api/locations/invalid-uuid')
          .expect(400);
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

  describe('PUT /api/partners/me/locations/:id', () => {
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
          .put(
            '/api/partners/me/locations/00000000-0000-0000-0000-000000000000',
          )
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
          .put(
            '/api/partners/me/locations/00000000-0000-0000-0000-000000000000',
          )
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
          .put(
            '/api/partners/me/locations/00000000-0000-0000-0000-000000000000',
          )
          .send({
            name: 'Updated Name',
          })
          .expect(401);
      });
    });
  });

  describe('DELETE /api/partners/me/locations/:id', () => {
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
});
