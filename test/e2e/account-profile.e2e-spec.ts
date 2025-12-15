/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AuthHelper } from '../support/auth/auth.helper';
import { AccountFactory } from '../support/factories/account.factory';
import { AccountGalleryFactory } from '../support/factories/account-gallery.factory';

describe('Account Profile E2E', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let accountFactory: AccountFactory;
  let galleryFactory: AccountGalleryFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    accountFactory = new AccountFactory(ctx.db);
    galleryFactory = new AccountGalleryFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanAllData();
  });

  describe('PATCH /api/accounts/me/profile', () => {
    describe('Happy Path', () => {
      it('should update media fields', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const account = await accountFactory.create({ userId: user.user.id });

        const response = await request(ctx.server)
          .patch('/api/accounts/me/profile')
          .set(authHelper.authHeader(user))
          .send({
            avatarUrl: 'https://example.com/new-avatar.jpg',
            coverImageUrl: 'https://example.com/new-cover.jpg',
            videoIntroUrl: 'https://example.com/intro.mp4',
          })
          .expect(200);

        expect(response.body).toMatchObject({
          id: account.id,
          avatarUrl: 'https://example.com/new-avatar.jpg',
          coverImageUrl: 'https://example.com/new-cover.jpg',
          videoIntroUrl: 'https://example.com/intro.mp4',
        });
      });

      it('should update contact info fields', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const account = await accountFactory.create({ userId: user.user.id });

        const response = await request(ctx.server)
          .patch('/api/accounts/me/profile')
          .set(authHelper.authHeader(user))
          .send({
            phone: '0901234567',
            businessEmail: 'business@example.com',
            website: 'https://mybusiness.com',
            socialLinks: {
              facebook: 'https://facebook.com/mybusiness',
              instagram: 'https://instagram.com/mybusiness',
            },
          })
          .expect(200);

        expect(response.body).toMatchObject({
          id: account.id,
          phone: '0901234567',
          businessEmail: 'business@example.com',
          website: 'https://mybusiness.com',
          socialLinks: {
            facebook: 'https://facebook.com/mybusiness',
            instagram: 'https://instagram.com/mybusiness',
          },
        });
      });

      it('should update professional info fields', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const account = await accountFactory.create({ userId: user.user.id });

        const response = await request(ctx.server)
          .patch('/api/accounts/me/profile')
          .set(authHelper.authHeader(user))
          .send({
            tagline: 'Professional nail services',
            languages: ['vi', 'en'],
            serviceAreas: [
              { district: 'Quận 1', city: 'Thành phố Hồ Chí Minh' },
              { district: 'Quận 3', city: 'Thành phố Hồ Chí Minh' },
            ],
            priceRange: {
              min: 100000,
              max: 500000,
              currency: 'VND',
            },
          })
          .expect(200);

        expect(response.body).toMatchObject({
          id: account.id,
          tagline: 'Professional nail services',
          languages: ['vi', 'en'],
          serviceAreas: [
            { district: 'Quận 1', city: 'Thành phố Hồ Chí Minh' },
            { district: 'Quận 3', city: 'Thành phố Hồ Chí Minh' },
          ],
          priceRange: {
            min: 100000,
            max: 500000,
            currency: 'VND',
          },
        });
      });

      it('should update working hours', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await accountFactory.create({ userId: user.user.id });

        const workingHours = {
          monday: { open: '09:00', close: '18:00', isOpen: true },
          tuesday: { open: '09:00', close: '18:00', isOpen: true },
          wednesday: { open: '09:00', close: '18:00', isOpen: true },
          thursday: { open: '09:00', close: '18:00', isOpen: true },
          friday: { open: '09:00', close: '18:00', isOpen: true },
          saturday: { open: '10:00', close: '15:00', isOpen: true },
        };

        const response = await request(ctx.server)
          .patch('/api/accounts/me/profile')
          .set(authHelper.authHeader(user))
          .send({ workingHours })
          .expect(200);

        expect(response.body.workingHours).toMatchObject(workingHours);
      });

      it('should update multiple field groups at once', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const account = await accountFactory.create({ userId: user.user.id });

        const response = await request(ctx.server)
          .patch('/api/accounts/me/profile')
          .set(authHelper.authHeader(user))
          .send({
            avatarUrl: 'https://example.com/avatar.jpg',
            phone: '0901234567',
            tagline: 'Best services',
            languages: ['vi'],
          })
          .expect(200);

        expect(response.body).toMatchObject({
          id: account.id,
          avatarUrl: 'https://example.com/avatar.jpg',
          phone: '0901234567',
          tagline: 'Best services',
          languages: ['vi'],
        });
      });

      it('should clear optional fields with null', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await accountFactory.create({
          userId: user.user.id,
          phone: '0901234567',
          tagline: 'Old tagline',
        });

        const response = await request(ctx.server)
          .patch('/api/accounts/me/profile')
          .set(authHelper.authHeader(user))
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
      it('should reject invalid URL for avatarUrl', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await accountFactory.create({ userId: user.user.id });

        await request(ctx.server)
          .patch('/api/accounts/me/profile')
          .set(authHelper.authHeader(user))
          .send({
            avatarUrl: 'not-a-valid-url',
          })
          .expect(400);
      });

      it('should reject tagline exceeding max length', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await accountFactory.create({ userId: user.user.id });

        await request(ctx.server)
          .patch('/api/accounts/me/profile')
          .set(authHelper.authHeader(user))
          .send({
            tagline: 'a'.repeat(101), // max 100 chars
          })
          .expect(400);
      });

      it('should reject invalid price range', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await accountFactory.create({ userId: user.user.id });

        await request(ctx.server)
          .patch('/api/accounts/me/profile')
          .set(authHelper.authHeader(user))
          .send({
            priceRange: {
              min: -100, // negative not allowed
              max: 500000,
              currency: 'VND',
            },
          })
          .expect(400);
      });
    });

    describe('Not Found', () => {
      it('should return 404 if account does not exist', async () => {
        const user = await authHelper.createAuthenticatedUser();
        // Don't create account

        await request(ctx.server)
          .patch('/api/accounts/me/profile')
          .set(authHelper.authHeader(user))
          .send({
            tagline: 'Test',
          })
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .patch('/api/accounts/me/profile')
          .send({ tagline: 'Test' })
          .expect(401);
      });

      it('should return 401 with invalid token', async () => {
        await request(ctx.server)
          .patch('/api/accounts/me/profile')
          .set('Authorization', 'Bearer invalid-token')
          .send({ tagline: 'Test' })
          .expect(401);
      });
    });
  });

  describe('GET /api/accounts/me/gallery', () => {
    describe('Happy Path', () => {
      it('should return empty gallery for new account', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await accountFactory.create({ userId: user.user.id });

        const response = await request(ctx.server)
          .get('/api/accounts/me/gallery')
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body).toEqual([]);
      });

      it('should return gallery images sorted by sortOrder', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const account = await accountFactory.create({ userId: user.user.id });

        await galleryFactory.create({ accountId: account.id, sortOrder: 2 });
        await galleryFactory.create({ accountId: account.id, sortOrder: 0 });
        await galleryFactory.create({ accountId: account.id, sortOrder: 1 });

        const response = await request(ctx.server)
          .get('/api/accounts/me/gallery')
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body).toHaveLength(3);
        expect(response.body[0].sortOrder).toBe(0);
        expect(response.body[1].sortOrder).toBe(1);
        expect(response.body[2].sortOrder).toBe(2);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server).get('/api/accounts/me/gallery').expect(401);
      });
    });
  });

  describe('POST /api/accounts/me/gallery', () => {
    describe('Happy Path', () => {
      it('should add image to gallery', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const account = await accountFactory.create({ userId: user.user.id });

        const response = await request(ctx.server)
          .post('/api/accounts/me/gallery')
          .set(authHelper.authHeader(user))
          .send({
            imageUrl: 'https://example.com/gallery/image1.jpg',
            caption: 'My first gallery image',
            sortOrder: 0,
          })
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(String),
          accountId: account.id,
          imageUrl: 'https://example.com/gallery/image1.jpg',
          caption: 'My first gallery image',
          sortOrder: 0,
        });
      });

      it('should add image without caption', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await accountFactory.create({ userId: user.user.id });

        const response = await request(ctx.server)
          .post('/api/accounts/me/gallery')
          .set(authHelper.authHeader(user))
          .send({
            imageUrl: 'https://example.com/gallery/image.jpg',
          })
          .expect(201);

        expect(response.body.caption).toBeNull();
      });
    });

    describe('Validation Errors', () => {
      it('should reject missing imageUrl', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await accountFactory.create({ userId: user.user.id });

        await request(ctx.server)
          .post('/api/accounts/me/gallery')
          .set(authHelper.authHeader(user))
          .send({
            caption: 'No image URL',
          })
          .expect(400);
      });

      it('should reject invalid imageUrl', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await accountFactory.create({ userId: user.user.id });

        await request(ctx.server)
          .post('/api/accounts/me/gallery')
          .set(authHelper.authHeader(user))
          .send({
            imageUrl: 'not-a-valid-url',
          })
          .expect(400);
      });
    });

    describe('Not Found', () => {
      it('should return 404 if account does not exist', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/accounts/me/gallery')
          .set(authHelper.authHeader(user))
          .send({
            imageUrl: 'https://example.com/image.jpg',
          })
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .post('/api/accounts/me/gallery')
          .send({ imageUrl: 'https://example.com/image.jpg' })
          .expect(401);
      });
    });
  });

  describe('PATCH /api/accounts/me/gallery/:id', () => {
    describe('Happy Path', () => {
      it('should update gallery image caption', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const account = await accountFactory.create({ userId: user.user.id });
        const gallery = await galleryFactory.create({
          accountId: account.id,
          caption: 'Old caption',
        });

        const response = await request(ctx.server)
          .patch(`/api/accounts/me/gallery/${gallery.id}`)
          .set(authHelper.authHeader(user))
          .send({
            caption: 'New caption',
          })
          .expect(200);

        expect(response.body).toMatchObject({
          id: gallery.id,
          caption: 'New caption',
        });
      });

      it('should update gallery image URL', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const account = await accountFactory.create({ userId: user.user.id });
        const gallery = await galleryFactory.create({ accountId: account.id });

        const response = await request(ctx.server)
          .patch(`/api/accounts/me/gallery/${gallery.id}`)
          .set(authHelper.authHeader(user))
          .send({
            imageUrl: 'https://example.com/new-image.jpg',
          })
          .expect(200);

        expect(response.body.imageUrl).toBe(
          'https://example.com/new-image.jpg',
        );
      });

      it('should clear caption with null', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const account = await accountFactory.create({ userId: user.user.id });
        const gallery = await galleryFactory.create({
          accountId: account.id,
          caption: 'Has caption',
        });

        const response = await request(ctx.server)
          .patch(`/api/accounts/me/gallery/${gallery.id}`)
          .set(authHelper.authHeader(user))
          .send({
            caption: null,
          })
          .expect(200);

        expect(response.body.caption).toBeNull();
      });
    });

    describe('Forbidden', () => {
      it('should return 403 when updating another user gallery', async () => {
        const user1 = await authHelper.createAuthenticatedUser();
        const user2 = await authHelper.createAuthenticatedUser();
        const account1 = await accountFactory.create({ userId: user1.user.id });
        await accountFactory.create({ userId: user2.user.id });
        const gallery = await galleryFactory.create({ accountId: account1.id });

        await request(ctx.server)
          .patch(`/api/accounts/me/gallery/${gallery.id}`)
          .set(authHelper.authHeader(user2))
          .send({
            caption: 'Trying to update',
          })
          .expect(403);
      });
    });

    describe('Not Found', () => {
      it('should return 404 for non-existent gallery image', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await accountFactory.create({ userId: user.user.id });

        await request(ctx.server)
          .patch('/api/accounts/me/gallery/gal_nonexistent123456789012')
          .set(authHelper.authHeader(user))
          .send({
            caption: 'New caption',
          })
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .patch('/api/accounts/me/gallery/gal_123')
          .send({ caption: 'Test' })
          .expect(401);
      });
    });
  });

  describe('DELETE /api/accounts/me/gallery/:id', () => {
    describe('Happy Path', () => {
      it('should delete gallery image', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const account = await accountFactory.create({ userId: user.user.id });
        const gallery = await galleryFactory.create({ accountId: account.id });

        await request(ctx.server)
          .delete(`/api/accounts/me/gallery/${gallery.id}`)
          .set(authHelper.authHeader(user))
          .expect(204);

        // Verify it's deleted
        const response = await request(ctx.server)
          .get('/api/accounts/me/gallery')
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body).toHaveLength(0);
      });
    });

    describe('Forbidden', () => {
      it('should return 403 when deleting another user gallery', async () => {
        const user1 = await authHelper.createAuthenticatedUser();
        const user2 = await authHelper.createAuthenticatedUser();
        const account1 = await accountFactory.create({ userId: user1.user.id });
        await accountFactory.create({ userId: user2.user.id });
        const gallery = await galleryFactory.create({ accountId: account1.id });

        await request(ctx.server)
          .delete(`/api/accounts/me/gallery/${gallery.id}`)
          .set(authHelper.authHeader(user2))
          .expect(403);
      });
    });

    describe('Not Found', () => {
      it('should return 404 for non-existent gallery image', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await accountFactory.create({ userId: user.user.id });

        await request(ctx.server)
          .delete('/api/accounts/me/gallery/gal_nonexistent123456789012')
          .set(authHelper.authHeader(user))
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .delete('/api/accounts/me/gallery/gal_123')
          .expect(401);
      });
    });
  });

  describe('PUT /api/accounts/me/gallery/reorder', () => {
    describe('Happy Path', () => {
      it('should reorder gallery images', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const account = await accountFactory.create({ userId: user.user.id });

        const gallery1 = await galleryFactory.create({
          accountId: account.id,
          sortOrder: 0,
        });
        const gallery2 = await galleryFactory.create({
          accountId: account.id,
          sortOrder: 1,
        });
        const gallery3 = await galleryFactory.create({
          accountId: account.id,
          sortOrder: 2,
        });

        await request(ctx.server)
          .put('/api/accounts/me/gallery/reorder')
          .set(authHelper.authHeader(user))
          .send({
            items: [
              { id: gallery3.id, sortOrder: 0 },
              { id: gallery1.id, sortOrder: 1 },
              { id: gallery2.id, sortOrder: 2 },
            ],
          })
          .expect(200);

        // Verify new order
        const response = await request(ctx.server)
          .get('/api/accounts/me/gallery')
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body[0].id).toBe(gallery3.id);
        expect(response.body[1].id).toBe(gallery1.id);
        expect(response.body[2].id).toBe(gallery2.id);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty items array gracefully', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await accountFactory.create({ userId: user.user.id });

        // Empty array is acceptable - no items to reorder
        await request(ctx.server)
          .put('/api/accounts/me/gallery/reorder')
          .set(authHelper.authHeader(user))
          .send({
            items: [],
          })
          .expect(200);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .put('/api/accounts/me/gallery/reorder')
          .send({ items: [] })
          .expect(401);
      });
    });
  });

  describe('GET /api/accounts/:id/gallery', () => {
    describe('Happy Path', () => {
      it('should return public gallery view', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const account = await accountFactory.create({ userId: user.user.id });
        await galleryFactory.createMany(account.id, 3);

        const response = await request(ctx.server)
          .get(`/api/accounts/${account.id}/gallery`)
          .expect(200);

        expect(response.body).toHaveLength(3);
      });

      it('should work without authentication', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const account = await accountFactory.create({ userId: user.user.id });
        await galleryFactory.create({ accountId: account.id });

        await request(ctx.server)
          .get(`/api/accounts/${account.id}/gallery`)
          .expect(200);
      });
    });

    describe('Not Found', () => {
      it('should return empty array for account without gallery', async () => {
        const user = await authHelper.createAuthenticatedUser();
        const account = await accountFactory.create({ userId: user.user.id });

        const response = await request(ctx.server)
          .get(`/api/accounts/${account.id}/gallery`)
          .expect(200);

        expect(response.body).toEqual([]);
      });
    });
  });
});
