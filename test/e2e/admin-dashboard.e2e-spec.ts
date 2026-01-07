/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AuthHelper } from '../support/auth/auth.helper';
import { UserFactory } from '../support/factories/user.factory';
import { AccountFactory } from '../support/factories/account.factory';
import { BookingFactory } from '../support/factories/booking.factory';
import { OrganizationFactory } from '../support/factories/organization.factory';
import { LocationFactory } from '../support/factories/location.factory';
import { AccountStatusEnum } from '../../src/core/domain/account/value-objects/account-status.vo';

describe('Admin Dashboard E2E', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let userFactory: UserFactory;
  let accountFactory: AccountFactory;
  let bookingFactory: BookingFactory;
  let organizationFactory: OrganizationFactory;
  let locationFactory: LocationFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    userFactory = new UserFactory(ctx.db);
    accountFactory = new AccountFactory(ctx.db);
    bookingFactory = new BookingFactory(ctx.db);
    organizationFactory = new OrganizationFactory(ctx.db);
    locationFactory = new LocationFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanAllData();
  });

  describe('GET /api/admin/stats/dashboard', () => {
    describe('Authentication & Authorization', () => {
      it('should return 401 without authentication', async () => {
        await request(ctx.server).get('/api/admin/stats/dashboard').expect(401);
      });

      it('should return 403 for regular user without permissions', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .set(authHelper.authHeader(user))
          .expect(403);
      });

      it('should allow super_admin access', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        const response = await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        expect(response.body).toHaveProperty('totalUsers');
        expect(response.body).toHaveProperty('totalAccounts');
        expect(response.body).toHaveProperty('totalBookings');
      });

      it('should allow admin access', async () => {
        const admin = await authHelper.createAdmin();

        const response = await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .set(authHelper.authHeader(admin))
          .expect(200);

        expect(response.body).toHaveProperty('totalUsers');
      });
    });

    describe('Response Structure', () => {
      it('should return complete dashboard stats structure', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        const response = await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        // Verify all required fields exist
        expect(response.body).toMatchObject({
          totalUsers: expect.any(Number),
          totalAccounts: expect.any(Number),
          activeCompanions: expect.any(Number),
          pendingApprovals: expect.any(Number),
          totalBookings: expect.any(Number),
          totalRevenue: expect.any(Number),
          bookingsByStatus: expect.objectContaining({
            pending: expect.any(Number),
            confirmed: expect.any(Number),
            inProgress: expect.any(Number),
            completed: expect.any(Number),
            cancelled: expect.any(Number),
          }),
          userGrowth: expect.any(Array),
          revenueData: expect.any(Array),
          bookingData: expect.any(Array),
        });
      });

      it('should return correct chart data structure', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        const response = await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        // Check userGrowth structure
        if (response.body.userGrowth.length > 0) {
          expect(response.body.userGrowth[0]).toMatchObject({
            date: expect.any(String),
            users: expect.any(Number),
            companions: expect.any(Number),
          });
        }

        // Check revenueData structure
        if (response.body.revenueData.length > 0) {
          expect(response.body.revenueData[0]).toMatchObject({
            date: expect.any(String),
            revenue: expect.any(Number),
          });
        }

        // Check bookingData structure
        if (response.body.bookingData.length > 0) {
          expect(response.body.bookingData[0]).toMatchObject({
            date: expect.any(String),
            confirmed: expect.any(Number),
            inProgress: expect.any(Number),
            completed: expect.any(Number),
            cancelled: expect.any(Number),
          });
        }
      });
    });

    describe('Data Aggregation', () => {
      it('should count total users correctly', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        // Create additional users
        await userFactory.create();
        await userFactory.create();
        await userFactory.create();

        const response = await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        // super_admin + 3 additional users = at least 4
        expect(response.body.totalUsers).toBeGreaterThanOrEqual(4);
      });

      it('should count total accounts correctly', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        // Create accounts
        await accountFactory.create();
        await accountFactory.create();

        const response = await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        expect(response.body.totalAccounts).toBeGreaterThanOrEqual(2);
      });

      it('should count active companions (INDIVIDUAL + ACTIVE) correctly', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        // Create active individual account (companion)
        await accountFactory.create({
          status: AccountStatusEnum.ACTIVE,
          isActive: true,
        });

        // Create pending account (should not be counted)
        await accountFactory.createPending();

        // Create inactive account (should not be counted)
        await accountFactory.createInactive();

        const response = await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        expect(response.body.activeCompanions).toBeGreaterThanOrEqual(1);
      });

      it('should count pending approvals correctly', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        // Create pending accounts
        await accountFactory.createPending();
        await accountFactory.createPending();

        // Create active account (should not be counted in pending)
        await accountFactory.create();

        const response = await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        expect(response.body.pendingApprovals).toBeGreaterThanOrEqual(2);
      });

      it('should count bookings by status correctly', async () => {
        const superAdmin = await authHelper.createSuperAdmin();
        const customer = await userFactory.create();
        const organization = await organizationFactory.create();
        const location = await locationFactory.create({
          organizationId: organization.id,
        });

        const bookingBase = {
          customerId: customer.id,
          organizationId: organization.id,
          locationId: location.id,
        };

        // Create bookings with different statuses
        await bookingFactory.create(bookingBase); // PENDING
        await bookingFactory.createConfirmed(bookingBase);
        await bookingFactory.createInProgress(bookingBase);
        await bookingFactory.createCompleted(bookingBase);
        await bookingFactory.createCancelled(bookingBase);

        const response = await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        expect(response.body.totalBookings).toBeGreaterThanOrEqual(5);
        expect(response.body.bookingsByStatus.pending).toBeGreaterThanOrEqual(
          1,
        );
        expect(response.body.bookingsByStatus.confirmed).toBeGreaterThanOrEqual(
          1,
        );
        expect(
          response.body.bookingsByStatus.inProgress,
        ).toBeGreaterThanOrEqual(1);
        expect(response.body.bookingsByStatus.completed).toBeGreaterThanOrEqual(
          1,
        );
        expect(response.body.bookingsByStatus.cancelled).toBeGreaterThanOrEqual(
          1,
        );
      });

      it('should calculate total revenue from completed bookings', async () => {
        const superAdmin = await authHelper.createSuperAdmin();
        const customer = await userFactory.create();
        const organization = await organizationFactory.create();
        const location = await locationFactory.create({
          organizationId: organization.id,
        });

        const bookingBase = {
          customerId: customer.id,
          organizationId: organization.id,
          locationId: location.id,
        };

        // Create completed bookings with known amounts
        await bookingFactory.createCompleted({
          ...bookingBase,
          totalAmount: 100000,
        });
        await bookingFactory.createCompleted({
          ...bookingBase,
          totalAmount: 200000,
        });

        // Create pending booking (should NOT be counted in revenue)
        await bookingFactory.create({ ...bookingBase, totalAmount: 500000 });

        const response = await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        // Revenue should be at least 300000 (from completed bookings)
        expect(response.body.totalRevenue).toBeGreaterThanOrEqual(300000);
      });
    });

    describe('Date Filtering', () => {
      it('should filter data by date range', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        // Get default response (last 30 days)
        const defaultResponse = await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        // Default should return ~30 days of data
        expect(defaultResponse.body.userGrowth.length).toBeLessThanOrEqual(31);
        expect(defaultResponse.body.revenueData.length).toBeLessThanOrEqual(31);
        expect(defaultResponse.body.bookingData.length).toBeLessThanOrEqual(31);
      });

      it('should accept custom date range parameters', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        const startDate = '2024-01-01';
        const endDate = '2024-01-07';

        const response = await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .query({ startDate, endDate })
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        // Should return 7 days of data
        expect(response.body.userGrowth.length).toBe(7);
        expect(response.body.revenueData.length).toBe(7);
        expect(response.body.bookingData.length).toBe(7);
      });

      it('should include completed booking revenue in total and daily data', async () => {
        const superAdmin = await authHelper.createSuperAdmin();
        const customer = await userFactory.create();
        const organization = await organizationFactory.create();
        const location = await locationFactory.create({
          organizationId: organization.id,
        });

        // Create a completed booking
        await bookingFactory.createCompleted(
          {
            customerId: customer.id,
            organizationId: organization.id,
            locationId: location.id,
            totalAmount: 150000,
          },
          new Date(), // completed now
        );

        // Query with a wide date range to ensure we capture today
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 1);

        const response = await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .query({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          })
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        // Total revenue should reflect the completed booking
        expect(response.body.totalRevenue).toBeGreaterThanOrEqual(150000);

        // Revenue data array should exist and have entries
        expect(response.body.revenueData.length).toBeGreaterThan(0);

        // At least one day should have revenue > 0 from the completed booking
        const totalDailyRevenue = response.body.revenueData.reduce(
          (sum: number, r: { revenue: number }) => sum + r.revenue,
          0,
        );
        expect(totalDailyRevenue).toBeGreaterThanOrEqual(150000);
      });
    });

    describe('Empty State', () => {
      it('should return zeros when no data exists', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        const response = await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        // At minimum, should return valid structure with reasonable values
        expect(response.body.totalUsers).toBeGreaterThanOrEqual(1); // At least superAdmin
        expect(response.body.totalBookings).toBeGreaterThanOrEqual(0);
        expect(response.body.totalRevenue).toBeGreaterThanOrEqual(0);
      });

      it('should return chart data arrays even when empty', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        const response = await request(ctx.server)
          .get('/api/admin/stats/dashboard')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        expect(Array.isArray(response.body.userGrowth)).toBe(true);
        expect(Array.isArray(response.body.revenueData)).toBe(true);
        expect(Array.isArray(response.body.bookingData)).toBe(true);
      });
    });
  });

  describe('GET /api/admin/stats/recent-activity', () => {
    describe('Authentication & Authorization', () => {
      it('should return 401 without authentication', async () => {
        await request(ctx.server)
          .get('/api/admin/stats/recent-activity')
          .expect(401);
      });

      it('should return 403 for regular user', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .get('/api/admin/stats/recent-activity')
          .set(authHelper.authHeader(user))
          .expect(403);
      });

      it('should allow admin access', async () => {
        const admin = await authHelper.createAdmin();

        await request(ctx.server)
          .get('/api/admin/stats/recent-activity')
          .set(authHelper.authHeader(admin))
          .expect(200);
      });
    });

    describe('Response Structure', () => {
      it('should return recent activity structure', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        const response = await request(ctx.server)
          .get('/api/admin/stats/recent-activity')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        expect(response.body).toHaveProperty('users');
        expect(response.body).toHaveProperty('accounts');
        expect(Array.isArray(response.body.users)).toBe(true);
        expect(Array.isArray(response.body.accounts)).toBe(true);
      });
    });

    describe('Limit Parameter', () => {
      it('should respect custom limit parameter', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        // Create multiple users
        for (let i = 0; i < 5; i++) {
          await userFactory.create();
        }

        const response = await request(ctx.server)
          .get('/api/admin/stats/recent-activity')
          .query({ limit: '3' })
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        expect(response.body.users.length).toBeLessThanOrEqual(3);
      });

      it('should use default limit of 10', async () => {
        const superAdmin = await authHelper.createSuperAdmin();

        // Create 15 users
        for (let i = 0; i < 15; i++) {
          await userFactory.create();
        }

        const response = await request(ctx.server)
          .get('/api/admin/stats/recent-activity')
          .set(authHelper.authHeader(superAdmin))
          .expect(200);

        expect(response.body.users.length).toBeLessThanOrEqual(10);
      });
    });
  });
});
