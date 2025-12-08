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

describe('POST /api/staff-invitations/accept', () => {
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
    it('should accept invitation with valid token', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      const invitedUser = await authHelper.createAuthenticatedUser();
      const invitation = await partnerStaffFactory.createPendingInvitation(
        partner.id,
        invitedUser.user.email,
        StaffRoleEnum.STAFF,
      );

      await request(ctx.server)
        .post('/api/staff-invitations/accept')
        .set(authHelper.authHeader(invitedUser))
        .send({
          token: invitation.invitationToken,
        })
        .expect(200);
    });

    it('should link user to staff record after acceptance', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      const invitedUser = await authHelper.createAuthenticatedUser();
      const invitation = await partnerStaffFactory.createPendingInvitation(
        partner.id,
        invitedUser.user.email,
        StaffRoleEnum.MANAGER,
      );

      await request(ctx.server)
        .post('/api/staff-invitations/accept')
        .set(authHelper.authHeader(invitedUser))
        .send({
          token: invitation.invitationToken,
        })
        .expect(200);

      // Verify user can now access staff list
      const membershipsResponse = await request(ctx.server)
        .get('/api/staff-invitations/my-memberships')
        .set(authHelper.authHeader(invitedUser))
        .expect(200);

      expect(membershipsResponse.body.items.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for missing token', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .post('/api/staff-invitations/accept')
        .set(authHelper.authHeader(user))
        .send({})
        .expect(400);
    });

    it('should return 400 for empty token', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .post('/api/staff-invitations/accept')
        .set(authHelper.authHeader(user))
        .send({
          token: '',
        })
        .expect(400);
    });
  });

  describe('Not Found', () => {
    it('should return 404 for invalid token', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .post('/api/staff-invitations/accept')
        .set(authHelper.authHeader(user))
        .send({
          token: 'invalid-token-12345',
        })
        .expect(404);
    });

    it('should return 404 for non-existent invitation', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .post('/api/staff-invitations/accept')
        .set(authHelper.authHeader(user))
        .send({
          token: '00000000-0000-0000-0000-000000000000',
        })
        .expect(404);
    });
  });

  describe('Conflict', () => {
    it('should return 409 when invitation already accepted', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      const invitedUser = await authHelper.createAuthenticatedUser();
      const invitation = await partnerStaffFactory.createPendingInvitation(
        partner.id,
        invitedUser.user.email,
        StaffRoleEnum.STAFF,
      );

      // Accept first time
      await request(ctx.server)
        .post('/api/staff-invitations/accept')
        .set(authHelper.authHeader(invitedUser))
        .send({
          token: invitation.invitationToken,
        })
        .expect(200);

      // Try to accept again
      await request(ctx.server)
        .post('/api/staff-invitations/accept')
        .set(authHelper.authHeader(invitedUser))
        .send({
          token: invitation.invitationToken,
        })
        .expect(409);
    });
  });

  describe('Forbidden', () => {
    it('should return 403 when different user tries to accept', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      const invitedUser = await authHelper.createAuthenticatedUser();
      const invitation = await partnerStaffFactory.createPendingInvitation(
        partner.id,
        invitedUser.user.email,
        StaffRoleEnum.STAFF,
      );

      const differentUser = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .post('/api/staff-invitations/accept')
        .set(authHelper.authHeader(differentUser))
        .send({
          token: invitation.invitationToken,
        })
        .expect(403);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server)
        .post('/api/staff-invitations/accept')
        .send({
          token: 'some-token',
        })
        .expect(401);
    });
  });
});
