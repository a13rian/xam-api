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

describe('POST /api/partners/me/staff/invite', () => {
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
    it('should invite staff member as owner', async () => {
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
        .post('/api/partners/me/staff/invite')
        .set(authHelper.authHeader(owner))
        .send({
          email: 'newstaff@example.com',
          role: StaffRoleEnum.STAFF,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: 'newstaff@example.com',
        role: StaffRoleEnum.STAFF,
        invitationStatus: 'pending',
      });
    });

    it('should invite manager', async () => {
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
        .post('/api/partners/me/staff/invite')
        .set(authHelper.authHeader(owner))
        .send({
          email: 'manager@example.com',
          role: StaffRoleEnum.MANAGER,
        })
        .expect(201);

      expect(response.body.role).toBe(StaffRoleEnum.MANAGER);
    });

    it('should return invitation token', async () => {
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
        .post('/api/partners/me/staff/invite')
        .set(authHelper.authHeader(owner))
        .send({
          email: 'newstaff@example.com',
          role: StaffRoleEnum.STAFF,
        })
        .expect(201);

      expect(response.body.invitationToken).toBeDefined();
      expect(response.body.invitationToken).not.toBeNull();
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for missing email', async () => {
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
        .post('/api/partners/me/staff/invite')
        .set(authHelper.authHeader(owner))
        .send({
          role: StaffRoleEnum.STAFF,
        })
        .expect(400);
    });

    it('should return 400 for invalid email', async () => {
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
        .post('/api/partners/me/staff/invite')
        .set(authHelper.authHeader(owner))
        .send({
          email: 'invalid-email',
          role: StaffRoleEnum.STAFF,
        })
        .expect(400);
    });

    it('should return 400 for missing role', async () => {
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
        .post('/api/partners/me/staff/invite')
        .set(authHelper.authHeader(owner))
        .send({
          email: 'newstaff@example.com',
        })
        .expect(400);
    });

    it('should return 400 for invalid role', async () => {
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
        .post('/api/partners/me/staff/invite')
        .set(authHelper.authHeader(owner))
        .send({
          email: 'newstaff@example.com',
          role: 'invalid_role',
        })
        .expect(400);
    });

    it('should return 400 when trying to invite as owner role', async () => {
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
        .post('/api/partners/me/staff/invite')
        .set(authHelper.authHeader(owner))
        .send({
          email: 'newowner@example.com',
          role: StaffRoleEnum.OWNER,
        })
        .expect(400);
    });
  });

  describe('Conflict', () => {
    it('should return 409 when email already invited', async () => {
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
        'existing@example.com',
        StaffRoleEnum.STAFF,
      );

      await request(ctx.server)
        .post('/api/partners/me/staff/invite')
        .set(authHelper.authHeader(owner))
        .send({
          email: 'existing@example.com',
          role: StaffRoleEnum.STAFF,
        })
        .expect(409);
    });

    it('should return 409 when inviting existing staff member', async () => {
      const owner = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActiveOrganization({
        userId: owner.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        owner.user.id,
        owner.user.email,
      );

      const existingStaff = await authHelper.createAuthenticatedUser();
      await partnerStaffFactory.create({
        partnerId: partner.id,
        userId: existingStaff.user.id,
        email: existingStaff.user.email,
        role: StaffRoleEnum.STAFF,
      });

      await request(ctx.server)
        .post('/api/partners/me/staff/invite')
        .set(authHelper.authHeader(owner))
        .send({
          email: existingStaff.user.email,
          role: StaffRoleEnum.STAFF,
        })
        .expect(409);
    });
  });

  describe('Forbidden', () => {
    it('should return 403 when non-owner/manager tries to invite', async () => {
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

      await request(ctx.server)
        .post('/api/partners/me/staff/invite')
        .set(authHelper.authHeader(staffUser))
        .send({
          email: 'newstaff@example.com',
          role: StaffRoleEnum.STAFF,
        })
        .expect(403);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if user has no partner profile', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .post('/api/partners/me/staff/invite')
        .set(authHelper.authHeader(user))
        .send({
          email: 'newstaff@example.com',
          role: StaffRoleEnum.STAFF,
        })
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server)
        .post('/api/partners/me/staff/invite')
        .send({
          email: 'newstaff@example.com',
          role: StaffRoleEnum.STAFF,
        })
        .expect(401);
    });
  });
});
