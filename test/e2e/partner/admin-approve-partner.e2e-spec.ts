import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { PartnerFactory } from '../../support/factories/partner.factory';
import { PartnerStatusEnum } from '../../../src/core/domain/partner/value-objects/partner-status.vo';

describe('POST /api/admin/partners/:id/approve', () => {
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
