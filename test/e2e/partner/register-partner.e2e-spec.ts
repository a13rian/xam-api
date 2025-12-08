import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { PartnerTypeEnum } from '../../../src/core/domain/partner/value-objects/partner-type.vo';

describe('POST /api/partners/register', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanAllData();
  });

  describe('Happy Path', () => {
    it('should register as freelance partner', async () => {
      const user = await authHelper.createAuthenticatedUser();

      const response = await request(ctx.server)
        .post('/api/partners/register')
        .set(authHelper.authHeader(user))
        .send({
          type: PartnerTypeEnum.FREELANCE,
          businessName: 'Test Freelance Business',
          description: 'A test freelance business',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        userId: user.user.id,
        type: PartnerTypeEnum.FREELANCE,
        status: 'pending',
        businessName: 'Test Freelance Business',
      });
    });

    it('should register as organization partner', async () => {
      const user = await authHelper.createAuthenticatedUser();

      const response = await request(ctx.server)
        .post('/api/partners/register')
        .set(authHelper.authHeader(user))
        .send({
          type: PartnerTypeEnum.ORGANIZATION,
          businessName: 'Test Organization',
          description: 'A test organization',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        type: PartnerTypeEnum.ORGANIZATION,
        status: 'pending',
      });
    });

    it('should register without description', async () => {
      const user = await authHelper.createAuthenticatedUser();

      const response = await request(ctx.server)
        .post('/api/partners/register')
        .set(authHelper.authHeader(user))
        .send({
          type: PartnerTypeEnum.FREELANCE,
          businessName: 'Minimal Business',
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
          businessName: 'Test Business',
        })
        .expect(400);
    });

    it('should return 400 for missing businessName', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .post('/api/partners/register')
        .set(authHelper.authHeader(user))
        .send({
          type: PartnerTypeEnum.FREELANCE,
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
          businessName: 'Test Business',
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
          type: PartnerTypeEnum.FREELANCE,
          businessName: 'First Business',
        })
        .expect(201);

      // Try to register again
      await request(ctx.server)
        .post('/api/partners/register')
        .set(authHelper.authHeader(user))
        .send({
          type: PartnerTypeEnum.ORGANIZATION,
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
          type: PartnerTypeEnum.FREELANCE,
          businessName: 'Test Business',
        })
        .expect(401);
    });
  });
});
