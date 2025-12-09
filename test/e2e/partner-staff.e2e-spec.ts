/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AuthHelper } from '../support/auth/auth.helper';
import { PartnerFactory } from '../support/factories/partner.factory';
import { PartnerStaffFactory } from '../support/factories/partner-staff.factory';
import { StaffRoleEnum } from '../../src/core/domain/partner/value-objects/staff-role.vo';

describe('Partner Staff E2E', () => {
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

  describe('POST /api/staff-invitations/accept', () => {
    describe('Happy Path', () => {
      it('should accept invitation with valid token', async () => {
        const owner = await authHelper.createAuthenticatedUser();
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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

  describe('GET /api/staff-invitations/my-memberships', () => {
    describe('Happy Path', () => {
      it('should return all partner memberships for user', async () => {
        const user = await authHelper.createAuthenticatedUser();

        // Create first partner and add user as staff
        const owner1 = await authHelper.createAuthenticatedUser();
        const partner1 = await partnerFactory.createActiveBusiness({
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
        const partner2 = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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

  describe('POST /api/partners/me/staff/invite', () => {
    describe('Happy Path', () => {
      it('should invite staff member as owner', async () => {
        const owner = await authHelper.createAuthenticatedUser();
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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

  describe('GET /api/partners/me/staff', () => {
    describe('Happy Path', () => {
      it('should list all staff members', async () => {
        const owner = await authHelper.createAuthenticatedUser();
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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

  describe('DELETE /api/partners/me/staff/:staffId', () => {
    describe('Happy Path', () => {
      it('should remove staff member as owner', async () => {
        const owner = await authHelper.createAuthenticatedUser();
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
        const partner = await partnerFactory.createActiveBusiness({
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
});
