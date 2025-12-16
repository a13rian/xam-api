/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AuthHelper } from '../support/auth/auth.helper';

describe('Notification Settings E2E', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanUsersAndOrganizations();
  });

  describe('GET /api/users/me/notifications', () => {
    describe('Happy Path', () => {
      it('should return default notification settings for new user', async () => {
        const user = await authHelper.createMember();

        const response = await request(ctx.server)
          .get('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .expect(200);

        // Default values as defined in UserOrmEntity
        expect(response.body).toMatchObject({
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
          bookingReminders: true,
        });
      });

      it('should return updated settings after modification', async () => {
        const user = await authHelper.createMember();

        // First update the settings
        await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({
            emailNotifications: false,
            pushNotifications: true,
          })
          .expect(200);

        // Then verify they persist
        const response = await request(ctx.server)
          .get('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body).toMatchObject({
          emailNotifications: false,
          pushNotifications: true,
          marketingEmails: false,
          bookingReminders: true,
        });
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .get('/api/users/me/notifications')
          .expect(401);
      });

      it('should return 401 with expired token', async () => {
        const user = await authHelper.createMember();
        const expiredToken = authHelper.createExpiredToken(user.user);

        await request(ctx.server)
          .get('/api/users/me/notifications')
          .set('Authorization', `Bearer ${expiredToken}`)
          .expect(401);
      });

      it('should return 401 with invalid token', async () => {
        const invalidToken = authHelper.createInvalidToken();

        await request(ctx.server)
          .get('/api/users/me/notifications')
          .set('Authorization', `Bearer ${invalidToken}`)
          .expect(401);
      });

      it('should return 401 with malformed token', async () => {
        const malformedToken = authHelper.createMalformedToken();

        await request(ctx.server)
          .get('/api/users/me/notifications')
          .set('Authorization', `Bearer ${malformedToken}`)
          .expect(401);
      });
    });
  });

  describe('PATCH /api/users/me/notifications', () => {
    describe('Happy Path', () => {
      it('should update all notification settings', async () => {
        const user = await authHelper.createMember();

        const response = await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({
            emailNotifications: false,
            pushNotifications: true,
            marketingEmails: true,
            bookingReminders: false,
          })
          .expect(200);

        expect(response.body).toMatchObject({
          emailNotifications: false,
          pushNotifications: true,
          marketingEmails: true,
          bookingReminders: false,
        });
      });

      it('should update single field (partial update)', async () => {
        const user = await authHelper.createMember();

        const response = await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({
            marketingEmails: true,
          })
          .expect(200);

        // marketingEmails updated, others remain default
        expect(response.body).toMatchObject({
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: true,
          bookingReminders: true,
        });
      });

      it('should allow empty body (no changes)', async () => {
        const user = await authHelper.createMember();

        const response = await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({})
          .expect(200);

        // All values remain default (as defined in UserOrmEntity)
        expect(response.body).toMatchObject({
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
          bookingReminders: true,
        });
      });

      it('should return updated settings in response', async () => {
        const user = await authHelper.createMember();

        // First update
        const firstUpdate = await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({
            emailNotifications: false,
          })
          .expect(200);

        expect(firstUpdate.body.emailNotifications).toBe(false);

        // Second update
        const secondUpdate = await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({
            marketingEmails: true,
          })
          .expect(200);

        expect(secondUpdate.body).toMatchObject({
          emailNotifications: false,
          marketingEmails: true,
        });
      });

      it('should work for different user roles', async () => {
        const admin = await authHelper.createAdmin();

        const response = await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(admin))
          .send({
            pushNotifications: true,
          })
          .expect(200);

        expect(response.body.pushNotifications).toBe(true);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .patch('/api/users/me/notifications')
          .send({
            emailNotifications: false,
          })
          .expect(401);
      });

      it('should return 401 with expired token', async () => {
        const user = await authHelper.createMember();
        const expiredToken = authHelper.createExpiredToken(user.user);

        await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set('Authorization', `Bearer ${expiredToken}`)
          .send({
            emailNotifications: false,
          })
          .expect(401);
      });

      it('should return 401 with invalid token', async () => {
        const invalidToken = authHelper.createInvalidToken();

        await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set('Authorization', `Bearer ${invalidToken}`)
          .send({
            emailNotifications: false,
          })
          .expect(401);
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for non-boolean emailNotifications', async () => {
        const user = await authHelper.createMember();

        await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({
            emailNotifications: 'yes',
          })
          .expect(400);
      });

      it('should return 400 for non-boolean pushNotifications', async () => {
        const user = await authHelper.createMember();

        await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({
            pushNotifications: 1,
          })
          .expect(400);
      });

      it('should return 400 for non-boolean marketingEmails', async () => {
        const user = await authHelper.createMember();

        await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({
            marketingEmails: 'true',
          })
          .expect(400);
      });

      it('should return 400 for number value in bookingReminders', async () => {
        const user = await authHelper.createMember();

        await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({
            bookingReminders: 0,
          })
          .expect(400);
      });

      it('should accept null as no change (class-validator treats null as optional)', async () => {
        const user = await authHelper.createMember();

        // null is treated as "not provided" by @IsOptional()
        const response = await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({
            bookingReminders: null,
          })
          .expect(200);

        // Value should remain unchanged (default true)
        expect(response.body.bookingReminders).toBe(true);
      });

      it('should return 400 for array value', async () => {
        const user = await authHelper.createMember();

        await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({
            emailNotifications: [true],
          })
          .expect(400);
      });

      it('should return 400 for object value', async () => {
        const user = await authHelper.createMember();

        await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({
            emailNotifications: { value: true },
          })
          .expect(400);
      });
    });

    describe('Edge Cases', () => {
      it('should handle updating to same values', async () => {
        const user = await authHelper.createMember();

        // Update with default values
        const response = await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({
            emailNotifications: true,
            pushNotifications: false,
            marketingEmails: false,
            bookingReminders: true,
          })
          .expect(200);

        expect(response.body).toMatchObject({
          emailNotifications: true,
          pushNotifications: false,
          marketingEmails: false,
          bookingReminders: true,
        });
      });

      it('should not affect other users notification settings', async () => {
        const user1 = await authHelper.createMember();
        const user2 = await authHelper.createMember();

        // User1 updates their settings
        await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user1))
          .send({
            emailNotifications: false,
            pushNotifications: true,
          })
          .expect(200);

        // User2's settings should remain default (as defined in UserOrmEntity)
        const user2Settings = await request(ctx.server)
          .get('/api/users/me/notifications')
          .set(authHelper.authHeader(user2))
          .expect(200);

        expect(user2Settings.body).toMatchObject({
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
          bookingReminders: true,
        });
      });

      it('should persist settings across multiple updates', async () => {
        const user = await authHelper.createMember();

        // First update
        await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({ emailNotifications: false })
          .expect(200);

        // Second update
        await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({ pushNotifications: true })
          .expect(200);

        // Third update
        await request(ctx.server)
          .patch('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .send({ marketingEmails: true })
          .expect(200);

        // Verify all changes persisted
        const finalSettings = await request(ctx.server)
          .get('/api/users/me/notifications')
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(finalSettings.body).toMatchObject({
          emailNotifications: false,
          pushNotifications: true,
          marketingEmails: true,
          bookingReminders: true,
        });
      });
    });
  });
});
