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

describe('DELETE /api/partners/me/staff/:staffId', () => {
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
    it('should remove staff member as owner', async () => {
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
      const staff = await partnerStaffFactory.create({
        partnerId: partner.id,
        userId: staffUser.user.id,
        email: staffUser.user.email,
        role: StaffRoleEnum.STAFF,
      });

      await request(ctx.server)
        .delete(`/api/partners/me/staff/${staff.id}`)
        .set(authHelper.authHeader(owner))
        .expect(200);

      // Verify staff is removed
      const listResponse = await request(ctx.server)
        .get('/api/partners/me/staff')
        .set(authHelper.authHeader(owner))
        .expect(200);

      expect(listResponse.body.items).toHaveLength(1); // Only owner remains
    });

    it('should remove pending invitation', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      const pendingStaff = await partnerStaffFactory.createPendingInvitation(
        partner.id,
        'pending@example.com',
        StaffRoleEnum.STAFF,
      );

      await request(ctx.server)
        .delete(`/api/partners/me/staff/${pendingStaff.id}`)
        .set(authHelper.authHeader(owner))
        .expect(200);

      const listResponse = await request(ctx.server)
        .get('/api/partners/me/staff')
        .set(authHelper.authHeader(owner))
        .expect(200);

      expect(listResponse.body.items).toHaveLength(1);
    });

    it('should allow manager to remove staff', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      const managerUser = await authHelper.createAuthenticatedUser();
      await partnerStaffFactory.create({
        partnerId: partner.id,
        userId: managerUser.user.id,
        email: managerUser.user.email,
        role: StaffRoleEnum.MANAGER,
      });

      const staffUser = await authHelper.createAuthenticatedUser();
      const staff = await partnerStaffFactory.create({
        partnerId: partner.id,
        userId: staffUser.user.id,
        email: staffUser.user.email,
        role: StaffRoleEnum.STAFF,
      });

      await request(ctx.server)
        .delete(`/api/partners/me/staff/${staff.id}`)
        .set(authHelper.authHeader(managerUser))
        .expect(200);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid UUID', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      await request(ctx.server)
        .delete('/api/partners/me/staff/invalid-uuid')
        .set(authHelper.authHeader(owner))
        .expect(400);
    });
  });

  describe('Forbidden', () => {
    it('should return 403 when trying to remove owner', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      const ownerStaff = await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      const managerUser = await authHelper.createAuthenticatedUser();
      await partnerStaffFactory.create({
        partnerId: partner.id,
        userId: managerUser.user.id,
        email: managerUser.user.email,
        role: StaffRoleEnum.MANAGER,
      });

      await request(ctx.server)
        .delete(`/api/partners/me/staff/${ownerStaff.id}`)
        .set(authHelper.authHeader(managerUser))
        .expect(403);
    });

    it('should return 403 when staff tries to remove another staff', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      const staffUser1 = await authHelper.createAuthenticatedUser();
      await partnerStaffFactory.create({
        partnerId: partner.id,
        userId: staffUser1.user.id,
        email: staffUser1.user.email,
        role: StaffRoleEnum.STAFF,
      });

      const staffUser2 = await authHelper.createAuthenticatedUser();
      const staff2 = await partnerStaffFactory.create({
        partnerId: partner.id,
        userId: staffUser2.user.id,
        email: staffUser2.user.email,
        role: StaffRoleEnum.STAFF,
      });

      await request(ctx.server)
        .delete(`/api/partners/me/staff/${staff2.id}`)
        .set(authHelper.authHeader(staffUser1))
        .expect(403);
    });

    it('should return 403 when manager tries to remove another manager', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      const manager1 = await authHelper.createAuthenticatedUser();
      await partnerStaffFactory.create({
        partnerId: partner.id,
        userId: manager1.user.id,
        email: manager1.user.email,
        role: StaffRoleEnum.MANAGER,
      });

      const manager2 = await authHelper.createAuthenticatedUser();
      const manager2Staff = await partnerStaffFactory.create({
        partnerId: partner.id,
        userId: manager2.user.id,
        email: manager2.user.email,
        role: StaffRoleEnum.MANAGER,
      });

      await request(ctx.server)
        .delete(`/api/partners/me/staff/${manager2Staff.id}`)
        .set(authHelper.authHeader(manager1))
        .expect(403);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if user has no partner profile', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .delete('/api/partners/me/staff/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(user))
        .expect(404);
    });

    it('should return 404 if staff does not exist', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      await request(ctx.server)
        .delete('/api/partners/me/staff/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(owner))
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server)
        .delete('/api/partners/me/staff/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });
  });
});
