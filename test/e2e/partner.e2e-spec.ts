/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars */
import request from 'supertest';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AuthHelper } from '../support/auth/auth.helper';
import { PartnerFactory } from '../support/factories/partner.factory';
import { PartnerTypeEnum } from '../../src/core/domain/partner/value-objects/partner-type.vo';
import { PartnerStatusEnum } from '../../src/core/domain/partner/value-objects/partner-status.vo';

describe('Partner E2E', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let partnerFactory: PartnerFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    partnerFactory = new PartnerFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanAllData();
  });

  describe('GET /api/partners/me', () => {
    describe('Happy Path', () => {
      it('should return partner profile for authenticated user (individual)', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const partner = await partnerFactory.createIndividual({
          userId: user.user.id,
          displayName: 'Test Individual',
        });

        const response = await request(ctx.server)
          .get('/api/partners/me')
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body).toMatchObject({
          id: partner.id,
          userId: user.user.id,
          type: PartnerTypeEnum.INDIVIDUAL,
          status: partner.status,
        });
      });

      it('should return partner profile for authenticated user (business)', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const partner = await partnerFactory.createBusiness({
          userId: user.user.id,
          businessName: 'Test Business',
        });

        const response = await request(ctx.server)
          .get('/api/partners/me')
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body).toMatchObject({
          id: partner.id,
          userId: user.user.id,
          type: PartnerTypeEnum.BUSINESS,
          status: partner.status,
        });
      });

      it('should return active partner profile', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const partner = await partnerFactory.createActive({
          userId: user.user.id,
        });

        const response = await request(ctx.server)
          .get('/api/partners/me')
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body.status).toBe('active');
      });
    });

    describe('Not Found', () => {
      it('should return 404 if user is not a partner', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .get('/api/partners/me')
          .set(authHelper.authHeader(user))
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server).get('/api/partners/me').expect(401);
      });
    });
  });

  describe('POST /api/partners/register', () => {
    describe('Happy Path', () => {
      it('should register as individual partner', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .post('/api/partners/register')
          .set(authHelper.authHeader(user))
          .send({
            type: PartnerTypeEnum.INDIVIDUAL,
            displayName: 'Test Individual',
            description: 'A test individual partner',
            specialization: 'Hair Styling',
            yearsExperience: 5,
          })
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(String),
          userId: user.user.id,
          type: PartnerTypeEnum.INDIVIDUAL,
          status: 'pending',
        });
      });

      it('should register as business partner', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .post('/api/partners/register')
          .set(authHelper.authHeader(user))
          .send({
            type: PartnerTypeEnum.BUSINESS,
            businessName: 'Test Business',
            description: 'A test business',
            taxId: '123456789',
            companySize: 'small',
          })
          .expect(201);

        expect(response.body).toMatchObject({
          type: PartnerTypeEnum.BUSINESS,
          status: 'pending',
        });
      });

      it('should register without description', async () => {
        const user = await authHelper.createAuthenticatedUser();

        const response = await request(ctx.server)
          .post('/api/partners/register')
          .set(authHelper.authHeader(user))
          .send({
            type: PartnerTypeEnum.INDIVIDUAL,
            displayName: 'Minimal Individual',
          })
          .expect(201);

        expect(response.body.description).toBeNull();
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for missing type', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/partners/register')
          .set(authHelper.authHeader(user))
          .send({
            displayName: 'Test Individual',
          })
          .expect(400);
      });

      it('should return 400 for missing displayName (individual)', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/partners/register')
          .set(authHelper.authHeader(user))
          .send({
            type: PartnerTypeEnum.INDIVIDUAL,
          })
          .expect(400);
      });

      it('should return 400 for missing businessName (business)', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/partners/register')
          .set(authHelper.authHeader(user))
          .send({
            type: PartnerTypeEnum.BUSINESS,
          })
          .expect(400);
      });

      it('should return 400 for invalid type', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/partners/register')
          .set(authHelper.authHeader(user))
          .send({
            type: 'invalid_type',
            displayName: 'Test Individual',
          })
          .expect(400);
      });
    });

    describe('Conflict', () => {
      it('should return 409 if user is already a partner', async () => {
        const user = await authHelper.createAuthenticatedUser();

        // Register first time
        await request(ctx.server)
          .post('/api/partners/register')
          .set(authHelper.authHeader(user))
          .send({
            type: PartnerTypeEnum.INDIVIDUAL,
            displayName: 'First Individual',
          })
          .expect(201);

        // Try to register again
        await request(ctx.server)
          .post('/api/partners/register')
          .set(authHelper.authHeader(user))
          .send({
            type: PartnerTypeEnum.BUSINESS,
            businessName: 'Second Business',
          })
          .expect(409);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .post('/api/partners/register')
          .send({
            type: PartnerTypeEnum.INDIVIDUAL,
            displayName: 'Test Individual',
          })
          .expect(401);
      });
    });
  });

  describe('POST /api/admin/partners/:id/approve', () => {
    describe('Happy Path', () => {
      it('should approve pending partner as admin', async () => {
        const admin = await authHelper.createSuperAdmin();
        const partnerUser = await authHelper.createAuthenticatedUser();
        const partner = await partnerFactory.create({
          userId: partnerUser.user.id,
          status: PartnerStatusEnum.PENDING,
        });

        const response = await request(ctx.server)
          .post(`/api/admin/partners/${partner.id}/approve`)
          .set(authHelper.authHeader(admin))
          .expect(200);

        expect(response.body.status).toBe('active');
      });
    });

    describe('Bad Request', () => {
      it('should return 400 if partner is already active', async () => {
        const admin = await authHelper.createSuperAdmin();
        const partnerUser = await authHelper.createAuthenticatedUser();
        const partner = await partnerFactory.createActive({
          userId: partnerUser.user.id,
        });

        await request(ctx.server)
          .post(`/api/admin/partners/${partner.id}/approve`)
          .set(authHelper.authHeader(admin))
          .expect(400);
      });
    });

    describe('Forbidden', () => {
      it('should return 403 for non-admin user', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const partnerUser = await authHelper.createAuthenticatedUser();
        const partner = await partnerFactory.create({
          userId: partnerUser.user.id,
        });

        await request(ctx.server)
          .post(`/api/admin/partners/${partner.id}/approve`)
          .set(authHelper.authHeader(user))
          .expect(403);
      });
    });

    describe('Not Found', () => {
      it('should return 404 for non-existent partner', async () => {
        const admin = await authHelper.createSuperAdmin();

        await request(ctx.server)
          .post(
            '/api/admin/partners/00000000-0000-0000-0000-000000000000/approve',
          )
          .set(authHelper.authHeader(admin))
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .post(
            '/api/admin/partners/00000000-0000-0000-0000-000000000000/approve',
          )
          .expect(401);
      });
    });
  });
});
