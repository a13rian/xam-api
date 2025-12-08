import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { PartnerFactory } from '../../support/factories/partner.factory';

describe('GET /api/partners/me', () => {
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

  describe('Happy Path', () => {
    it('should return partner profile for authenticated user', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.create({ userId: user.user.id });

      const response = await request(ctx.server)
        .get('/api/partners/me')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body).toMatchObject({
        id: partner.id,
        userId: user.user.id,
        type: partner.type,
        status: partner.status,
        businessName: partner.businessName,
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
