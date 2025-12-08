import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { PartnerFactory } from '../../support/factories/partner.factory';
import { PartnerStaffFactory } from '../../support/factories/partner-staff.factory';
import { StaffRoleEnum } from '../../../src/core/domain/partner/value-objects/staff-role.vo';

describe('GET /api/partners/me/staff', () => {
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
    it('should list all staff members', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      // Create additional staff members
      const staff1 = await authHelper.createAuthenticatedUser();
      await partnerStaffFactory.create({
        partnerId: partner.id,
        userId: staff1.user.id,
        email: staff1.user.email,
        role: StaffRoleEnum.MANAGER,
      });

      const staff2 = await authHelper.createAuthenticatedUser();
      await partnerStaffFactory.create({
        partnerId: partner.id,
        userId: staff2.user.id,
        email: staff2.user.email,
        role: StaffRoleEnum.STAFF,
      });

      const response = await request(ctx.server)
        .get('/api/partners/me/staff')
        .set(authHelper.authHeader(owner))
        .expect(200);

      expect(response.body.items).toHaveLength(3);
    });

    it('should return only owner when no other staff', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      const response = await request(ctx.server)
        .get('/api/partners/me/staff')
        .set(authHelper.authHeader(owner))
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].role).toBe(StaffRoleEnum.OWNER);
    });

    it('should include pending invitations', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      await partnerStaffFactory.createPendingInvitation(
        partner.id,
        'pending@example.com',
        StaffRoleEnum.STAFF,
      );

      const response = await request(ctx.server)
        .get('/api/partners/me/staff')
        .set(authHelper.authHeader(owner))
        .expect(200);

      expect(response.body.items).toHaveLength(2);
    });

    it('should allow staff member to view staff list', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      const staffUser = await authHelper.createAuthenticatedUser();
      await partnerStaffFactory.create({
        partnerId: partner.id,
        userId: staffUser.user.id,
        email: staffUser.user.email,
        role: StaffRoleEnum.STAFF,
      });

      const response = await request(ctx.server)
        .get('/api/partners/me/staff')
        .set(authHelper.authHeader(staffUser))
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if user has no partner profile', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .get('/api/partners/me/staff')
        .set(authHelper.authHeader(user))
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server).get('/api/partners/me/staff').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(ctx.server)
        .get('/api/partners/me/staff')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
