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

describe('GET /api/staff-invitations/my-memberships', () => {
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
    it('should return all partner memberships for user', async () => {
      const user = await authHelper.createAuthenticatedUser();

      // Create first partner and add user as staff
      const owner1 = await authHelper.createAuthenticatedUser();
      const partner1 = await partnerFactory.createActiveOrganization({
        userId: owner1.user.id,
        businessName: 'Partner 1',
      });
      await partnerStaffFactory.createOwner(
        partner1.id,
        owner1.user.id,
        owner1.user.email,
      );
      await partnerStaffFactory.create({
        partnerId: partner1.id,
        userId: user.user.id,
        email: user.user.email,
        role: StaffRoleEnum.STAFF,
      });

      // Create second partner and add user as manager
      const owner2 = await authHelper.createAuthenticatedUser();
      const partner2 = await partnerFactory.createActiveOrganization({
        userId: owner2.user.id,
        businessName: 'Partner 2',
      });
      await partnerStaffFactory.createOwner(
        partner2.id,
        owner2.user.id,
        owner2.user.email,
      );
      await partnerStaffFactory.create({
        partnerId: partner2.id,
        userId: user.user.id,
        email: user.user.email,
        role: StaffRoleEnum.MANAGER,
      });

      const response = await request(ctx.server)
        .get('/api/staff-invitations/my-memberships')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body.items).toHaveLength(2);
    });

    it('should return empty list when user has no memberships', async () => {
      const user = await authHelper.createAuthenticatedUser();

      const response = await request(ctx.server)
        .get('/api/staff-invitations/my-memberships')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body.items).toHaveLength(0);
    });

    it('should include user own partner as owner', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );

      const response = await request(ctx.server)
        .get('/api/staff-invitations/my-memberships')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].role).toBe(StaffRoleEnum.OWNER);
    });

    it('should return membership with partner details', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
        businessName: 'Test Business',
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
        .get('/api/staff-invitations/my-memberships')
        .set(authHelper.authHeader(staffUser))
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toMatchObject({
        partnerId: partner.id,
        role: StaffRoleEnum.STAFF,
      });
    });

    it('should not include pending invitations', async () => {
      const user = await authHelper.createAuthenticatedUser();

      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      // Create pending invitation (not accepted)
      await partnerStaffFactory.createPendingInvitation(
        partner.id,
        user.user.email,
        StaffRoleEnum.STAFF,
      );

      const response = await request(ctx.server)
        .get('/api/staff-invitations/my-memberships')
        .set(authHelper.authHeader(user))
        .expect(200);

      // Should be empty because invitation is pending
      expect(response.body.items).toHaveLength(0);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server)
        .get('/api/staff-invitations/my-memberships')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(ctx.server)
        .get('/api/staff-invitations/my-memberships')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
