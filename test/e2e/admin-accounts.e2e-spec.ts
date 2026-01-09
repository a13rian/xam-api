/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AuthHelper } from '../support/auth/auth.helper';
import { AccountFactory } from '../support/factories/account.factory';
import { AccountStatusEnum } from '../../src/core/domain/account/value-objects/account-status.vo';

describe('Admin Accounts E2E', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let accountFactory: AccountFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    accountFactory = new AccountFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanAllData();
  });

  describe('GET /api/admin/accounts/:id', () => {
    describe('Happy Path', () => {
      it('should return admin account details', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create({
          displayName: 'Test Partner',
          phone: '0901234567',
          businessEmail: 'partner@example.com',
          isVerified: true,
        });

        const response = await request(ctx.server)
          .get(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(admin))
          .expect(200);

        expect(response.body).toMatchObject({
          id: account.id,
          userId: account.userId,
          displayName: 'Test Partner',
          phone: '0901234567',
          businessEmail: 'partner@example.com',
          isVerified: true,
          status: 'active',
        });
        expect(response.body).toHaveProperty('createdAt');
        expect(response.body).toHaveProperty('updatedAt');
      });

      it('should include all admin-specific fields', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create({
          status: AccountStatusEnum.ACTIVE,
          isVerified: true,
          rating: 4.5,
          totalReviews: 10,
          completedBookings: 25,
        });

        const response = await request(ctx.server)
          .get(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(admin))
          .expect(200);

        expect(response.body).toMatchObject({
          id: account.id,
          userId: expect.any(String),
          isVerified: true,
          rating: 4.5,
          totalReviews: 10,
          completedBookings: 25,
        });
      });
    });

    describe('Not Found', () => {
      it('should return 404 for non-existent account', async () => {
        const admin = await authHelper.createAdmin();

        await request(ctx.server)
          .get('/api/admin/accounts/acc_nonexistent123456789012')
          .set(authHelper.authHeader(admin))
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .get('/api/admin/accounts/acc_123')
          .expect(401);
      });

      it('should return 403 for non-admin user', async () => {
        const member = await authHelper.createMember();
        const account = await accountFactory.create();

        await request(ctx.server)
          .get(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(member))
          .expect(403);
      });
    });
  });

  describe('PATCH /api/admin/accounts/:id', () => {
    describe('Happy Path', () => {
      it('should update account display name', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create({
          displayName: 'Old Name',
        });

        const response = await request(ctx.server)
          .patch(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(admin))
          .send({ displayName: 'New Name' })
          .expect(200);

        expect(response.body).toMatchObject({
          id: account.id,
          displayName: 'New Name',
        });
      });

      it('should update multiple fields', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create();

        const response = await request(ctx.server)
          .patch(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(admin))
          .send({
            displayName: 'Updated Partner',
            specialization: 'Hair Stylist',
            personalBio: 'Professional with 10 years experience',
            phone: '0909999999',
            businessEmail: 'updated@example.com',
            website: 'https://updated.com',
            tagline: 'Best service in town',
          })
          .expect(200);

        expect(response.body).toMatchObject({
          displayName: 'Updated Partner',
          specialization: 'Hair Stylist',
          personalBio: 'Professional with 10 years experience',
          phone: '0909999999',
          businessEmail: 'updated@example.com',
          website: 'https://updated.com',
          tagline: 'Best service in town',
        });
      });

      it('should update verification status', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create({ isVerified: false });

        const response = await request(ctx.server)
          .patch(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(admin))
          .send({ isVerified: true })
          .expect(200);

        expect(response.body.isVerified).toBe(true);
      });

      it('should clear optional fields with null', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create({
          phone: '0901234567',
          tagline: 'Old tagline',
        });

        const response = await request(ctx.server)
          .patch(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(admin))
          .send({
            phone: null,
            tagline: null,
          })
          .expect(200);

        expect(response.body.phone).toBeNull();
        expect(response.body.tagline).toBeNull();
      });
    });

    describe('Validation Errors', () => {
      it('should reject invalid email format', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create();

        await request(ctx.server)
          .patch(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(admin))
          .send({ businessEmail: 'not-an-email' })
          .expect(400);
      });

      it('should reject invalid website URL', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create();

        await request(ctx.server)
          .patch(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(admin))
          .send({ website: 'not-a-url' })
          .expect(400);
      });
    });

    describe('Not Found', () => {
      it('should return 404 for non-existent account', async () => {
        const admin = await authHelper.createAdmin();

        await request(ctx.server)
          .patch('/api/admin/accounts/acc_nonexistent123456789012')
          .set(authHelper.authHeader(admin))
          .send({ displayName: 'Test' })
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .patch('/api/admin/accounts/acc_123')
          .send({ displayName: 'Test' })
          .expect(401);
      });

      it('should return 403 for non-admin user', async () => {
        const member = await authHelper.createMember();
        const account = await accountFactory.create();

        await request(ctx.server)
          .patch(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(member))
          .send({ displayName: 'Test' })
          .expect(403);
      });
    });
  });

  describe('POST /api/admin/accounts/:id/suspend', () => {
    describe('Happy Path', () => {
      it('should suspend an active account', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create({
          status: AccountStatusEnum.ACTIVE,
        });

        await request(ctx.server)
          .post(`/api/admin/accounts/${account.id}/suspend`)
          .set(authHelper.authHeader(admin))
          .send({ reason: 'Violation of terms' })
          .expect(200);

        // Verify account is suspended
        const response = await request(ctx.server)
          .get(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(admin))
          .expect(200);

        expect(response.body.status).toBe('suspended');
      });

      it('should store suspension reason', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create({
          status: AccountStatusEnum.ACTIVE,
        });

        const suspendReason = 'Multiple customer complaints';

        await request(ctx.server)
          .post(`/api/admin/accounts/${account.id}/suspend`)
          .set(authHelper.authHeader(admin))
          .send({ reason: suspendReason })
          .expect(200);

        // Verify suspension reason is stored
        const response = await request(ctx.server)
          .get(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(admin))
          .expect(200);

        expect(response.body.status).toBe('suspended');
      });
    });

    describe('Validation Errors', () => {
      it('should reject missing reason', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create({
          status: AccountStatusEnum.ACTIVE,
        });

        await request(ctx.server)
          .post(`/api/admin/accounts/${account.id}/suspend`)
          .set(authHelper.authHeader(admin))
          .send({})
          .expect(400);
      });

      it('should reject empty reason', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create({
          status: AccountStatusEnum.ACTIVE,
        });

        await request(ctx.server)
          .post(`/api/admin/accounts/${account.id}/suspend`)
          .set(authHelper.authHeader(admin))
          .send({ reason: '' })
          .expect(400);
      });
    });

    describe('Business Rules', () => {
      it('should reject suspending already suspended account', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create({
          status: AccountStatusEnum.SUSPENDED,
        });

        await request(ctx.server)
          .post(`/api/admin/accounts/${account.id}/suspend`)
          .set(authHelper.authHeader(admin))
          .send({ reason: 'Another reason' })
          .expect(400);
      });
    });

    describe('Not Found', () => {
      it('should return 404 for non-existent account', async () => {
        const admin = await authHelper.createAdmin();

        await request(ctx.server)
          .post('/api/admin/accounts/acc_nonexistent123456789012/suspend')
          .set(authHelper.authHeader(admin))
          .send({ reason: 'Test reason' })
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .post('/api/admin/accounts/acc_123/suspend')
          .send({ reason: 'Test' })
          .expect(401);
      });

      it('should return 403 for non-admin user', async () => {
        const member = await authHelper.createMember();
        const account = await accountFactory.create();

        await request(ctx.server)
          .post(`/api/admin/accounts/${account.id}/suspend`)
          .set(authHelper.authHeader(member))
          .send({ reason: 'Test' })
          .expect(403);
      });
    });
  });

  describe('POST /api/admin/accounts/:id/activate', () => {
    describe('Happy Path', () => {
      it('should activate a suspended account', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create({
          status: AccountStatusEnum.SUSPENDED,
        });

        await request(ctx.server)
          .post(`/api/admin/accounts/${account.id}/activate`)
          .set(authHelper.authHeader(admin))
          .send({})
          .expect(200);

        // Verify account is active
        const response = await request(ctx.server)
          .get(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(admin))
          .expect(200);

        expect(response.body.status).toBe('active');
      });
    });

    describe('Business Rules', () => {
      it('should reject activating already active account', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create({
          status: AccountStatusEnum.ACTIVE,
        });

        await request(ctx.server)
          .post(`/api/admin/accounts/${account.id}/activate`)
          .set(authHelper.authHeader(admin))
          .send({})
          .expect(400);
      });

      it('should reject activating pending account (use approve instead)', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.createPending();

        await request(ctx.server)
          .post(`/api/admin/accounts/${account.id}/activate`)
          .set(authHelper.authHeader(admin))
          .send({})
          .expect(400);
      });
    });

    describe('Not Found', () => {
      it('should return 404 for non-existent account', async () => {
        const admin = await authHelper.createAdmin();

        await request(ctx.server)
          .post('/api/admin/accounts/acc_nonexistent123456789012/activate')
          .set(authHelper.authHeader(admin))
          .send({})
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .post('/api/admin/accounts/acc_123/activate')
          .send({})
          .expect(401);
      });

      it('should return 403 for non-admin user', async () => {
        const member = await authHelper.createMember();
        const account = await accountFactory.create({
          status: AccountStatusEnum.SUSPENDED,
        });

        await request(ctx.server)
          .post(`/api/admin/accounts/${account.id}/activate`)
          .set(authHelper.authHeader(member))
          .send({})
          .expect(403);
      });
    });
  });

  describe('DELETE /api/admin/accounts/:id', () => {
    describe('Happy Path', () => {
      it('should delete an account', async () => {
        const admin = await authHelper.createAdmin();
        const account = await accountFactory.create();

        await request(ctx.server)
          .delete(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(admin))
          .expect(204);

        // Verify account is deleted
        await request(ctx.server)
          .get(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(admin))
          .expect(404);
      });

      it('should delete account with any status', async () => {
        const admin = await authHelper.createAdmin();

        // Test with suspended account
        const suspendedAccount = await accountFactory.create({
          status: AccountStatusEnum.SUSPENDED,
        });

        await request(ctx.server)
          .delete(`/api/admin/accounts/${suspendedAccount.id}`)
          .set(authHelper.authHeader(admin))
          .expect(204);

        // Test with pending account
        const pendingAccount = await accountFactory.createPending();

        await request(ctx.server)
          .delete(`/api/admin/accounts/${pendingAccount.id}`)
          .set(authHelper.authHeader(admin))
          .expect(204);
      });
    });

    describe('Not Found', () => {
      it('should return 404 for non-existent account', async () => {
        const admin = await authHelper.createAdmin();

        await request(ctx.server)
          .delete('/api/admin/accounts/acc_nonexistent123456789012')
          .set(authHelper.authHeader(admin))
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .delete('/api/admin/accounts/acc_123')
          .expect(401);
      });

      it('should return 403 for non-admin user', async () => {
        const member = await authHelper.createMember();
        const account = await accountFactory.create();

        await request(ctx.server)
          .delete(`/api/admin/accounts/${account.id}`)
          .set(authHelper.authHeader(member))
          .expect(403);
      });
    });
  });

  describe('Integration: Account Lifecycle', () => {
    it('should handle full account lifecycle: create -> approve -> suspend -> activate -> delete', async () => {
      const admin = await authHelper.createAdmin();

      // Create pending account
      const account = await accountFactory.createPending({
        displayName: 'Lifecycle Test',
      });

      // Verify initial pending status
      let response = await request(ctx.server)
        .get(`/api/admin/accounts/${account.id}`)
        .set(authHelper.authHeader(admin))
        .expect(200);
      expect(response.body.status).toBe('pending');

      // Approve
      await request(ctx.server)
        .post(`/api/admin/accounts/${account.id}/approve`)
        .set(authHelper.authHeader(admin))
        .send({})
        .expect(200);

      response = await request(ctx.server)
        .get(`/api/admin/accounts/${account.id}`)
        .set(authHelper.authHeader(admin))
        .expect(200);
      expect(response.body.status).toBe('active');

      // Suspend
      await request(ctx.server)
        .post(`/api/admin/accounts/${account.id}/suspend`)
        .set(authHelper.authHeader(admin))
        .send({ reason: 'Policy violation' })
        .expect(200);

      response = await request(ctx.server)
        .get(`/api/admin/accounts/${account.id}`)
        .set(authHelper.authHeader(admin))
        .expect(200);
      expect(response.body.status).toBe('suspended');

      // Activate
      await request(ctx.server)
        .post(`/api/admin/accounts/${account.id}/activate`)
        .set(authHelper.authHeader(admin))
        .send({})
        .expect(200);

      response = await request(ctx.server)
        .get(`/api/admin/accounts/${account.id}`)
        .set(authHelper.authHeader(admin))
        .expect(200);
      expect(response.body.status).toBe('active');

      // Update
      await request(ctx.server)
        .patch(`/api/admin/accounts/${account.id}`)
        .set(authHelper.authHeader(admin))
        .send({ displayName: 'Updated Lifecycle Test', isVerified: true })
        .expect(200);

      response = await request(ctx.server)
        .get(`/api/admin/accounts/${account.id}`)
        .set(authHelper.authHeader(admin))
        .expect(200);
      expect(response.body.displayName).toBe('Updated Lifecycle Test');
      expect(response.body.isVerified).toBe(true);

      // Delete
      await request(ctx.server)
        .delete(`/api/admin/accounts/${account.id}`)
        .set(authHelper.authHeader(admin))
        .expect(204);

      // Verify deleted
      await request(ctx.server)
        .get(`/api/admin/accounts/${account.id}`)
        .set(authHelper.authHeader(admin))
        .expect(404);
    });
  });
});
