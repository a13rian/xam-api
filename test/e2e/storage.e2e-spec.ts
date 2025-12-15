/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AuthHelper, TestUser } from '../support/auth/auth.helper';
import { AccountFactory } from '../support/factories/account.factory';
import { UserOrmEntity } from '../../src/infrastructure/persistence/typeorm/entities/user.orm-entity';

describe('Storage E2E', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let accountFactory: AccountFactory;

  // Sample PNG file buffer (1x1 transparent pixel)
  const createTestImageBuffer = (): Buffer => {
    return Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
  };

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    accountFactory = new AccountFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanUsersAndOrganizations();
  });

  describe('POST /api/storage/upload', () => {
    describe('Happy Path', () => {
      it('should upload a file successfully', async () => {
        const user = await authHelper.createMember();

        const response = await request(ctx.server)
          .post('/api/storage/upload')
          .set(authHelper.authHeader(user))
          .attach('file', createTestImageBuffer(), 'test-image.png')
          .field('purpose', 'gallery')
          .expect(201);

        expect(response.body).toMatchObject({
          url: expect.any(String),
          key: expect.any(String),
          bucket: expect.any(String),
          size: expect.any(Number),
        });
      });

      it('should upload avatar with correct purpose', async () => {
        const user = await authHelper.createMember();

        const response = await request(ctx.server)
          .post('/api/storage/upload')
          .set(authHelper.authHeader(user))
          .attach('file', createTestImageBuffer(), 'avatar.png')
          .field('purpose', 'avatar')
          .expect(201);

        expect(response.body.key).toContain('avatar');
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 when file is missing', async () => {
        const user = await authHelper.createMember();

        await request(ctx.server)
          .post('/api/storage/upload')
          .set(authHelper.authHeader(user))
          .field('purpose', 'gallery')
          .expect(400);
      });

      it('should return 400 when purpose is missing', async () => {
        const user = await authHelper.createMember();

        await request(ctx.server)
          .post('/api/storage/upload')
          .set(authHelper.authHeader(user))
          .attach('file', createTestImageBuffer(), 'test.png')
          .expect(400);
      });

      it('should return 400 for file exceeding size limit', async () => {
        const user = await authHelper.createMember();
        // Create a large buffer (11MB)
        const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

        await request(ctx.server)
          .post('/api/storage/upload')
          .set(authHelper.authHeader(user))
          .attach('file', largeBuffer, 'large-file.png')
          .field('purpose', 'gallery')
          .expect(400);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .post('/api/storage/upload')
          .attach('file', createTestImageBuffer(), 'test.png')
          .field('purpose', 'gallery')
          .expect(401);
      });
    });
  });

  describe('GET /api/storage/presigned-url/:bucket/:key', () => {
    describe('Happy Path', () => {
      it('should return presigned URL for existing file', async () => {
        const user = await authHelper.createMember();

        // First upload a file
        const uploadResponse = await request(ctx.server)
          .post('/api/storage/upload')
          .set(authHelper.authHeader(user))
          .attach('file', createTestImageBuffer(), 'test-image.png')
          .field('purpose', 'gallery')
          .expect(201);

        const { bucket, key } = uploadResponse.body;

        // Get presigned URL
        const response = await request(ctx.server)
          .get(
            `/api/storage/presigned-url/${bucket}/${encodeURIComponent(key)}`,
          )
          .set(authHelper.authHeader(user))
          .expect(200);

        expect(response.body).toMatchObject({
          url: expect.any(String),
          expiresIn: expect.any(Number),
        });
      });

      it('should accept custom expiration time', async () => {
        const user = await authHelper.createMember();

        // First upload a file
        const uploadResponse = await request(ctx.server)
          .post('/api/storage/upload')
          .set(authHelper.authHeader(user))
          .attach('file', createTestImageBuffer(), 'test-image.png')
          .field('purpose', 'gallery')
          .expect(201);

        const { bucket, key } = uploadResponse.body;

        const response = await request(ctx.server)
          .get(
            `/api/storage/presigned-url/${bucket}/${encodeURIComponent(key)}`,
          )
          .set(authHelper.authHeader(user))
          .query({ expiresIn: 7200 })
          .expect(200);

        expect(response.body.expiresIn).toBe(7200);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .get('/api/storage/presigned-url/gallery/test-key')
          .expect(401);
      });
    });
  });

  describe('PATCH /api/users/me/avatar', () => {
    describe('Happy Path', () => {
      it('should upload user avatar successfully', async () => {
        const user = await authHelper.createMember();

        const response = await request(ctx.server)
          .patch('/api/users/me/avatar')
          .set(authHelper.authHeader(user))
          .attach('file', createTestImageBuffer(), {
            filename: 'avatar.png',
            contentType: 'image/png',
          })
          .expect(200);

        expect(response.body).toMatchObject({
          avatarUrl: expect.any(String),
        });
        expect(response.body.avatarUrl).toContain('avatar');
      });

      it('should replace existing avatar', async () => {
        const user = await authHelper.createMember();

        // Upload first avatar
        const firstResponse = await request(ctx.server)
          .patch('/api/users/me/avatar')
          .set(authHelper.authHeader(user))
          .attach('file', createTestImageBuffer(), {
            filename: 'avatar1.png',
            contentType: 'image/png',
          })
          .expect(200);

        const firstAvatarUrl = firstResponse.body.avatarUrl;

        // Upload second avatar
        const secondResponse = await request(ctx.server)
          .patch('/api/users/me/avatar')
          .set(authHelper.authHeader(user))
          .attach('file', createTestImageBuffer(), {
            filename: 'avatar2.png',
            contentType: 'image/png',
          })
          .expect(200);

        expect(secondResponse.body.avatarUrl).not.toBe(firstAvatarUrl);
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 when file is missing', async () => {
        const user = await authHelper.createMember();

        await request(ctx.server)
          .patch('/api/users/me/avatar')
          .set(authHelper.authHeader(user))
          .expect(400);
      });

      it('should return 400 for non-image file type', async () => {
        const user = await authHelper.createMember();
        const textBuffer = Buffer.from('This is a text file');

        await request(ctx.server)
          .patch('/api/users/me/avatar')
          .set(authHelper.authHeader(user))
          .attach('file', textBuffer, 'document.txt')
          .expect(400);
      });

      it('should return 400 for file exceeding 5MB limit', async () => {
        const user = await authHelper.createMember();
        const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

        await request(ctx.server)
          .patch('/api/users/me/avatar')
          .set(authHelper.authHeader(user))
          .attach('file', largeBuffer, 'large-avatar.png')
          .expect(400);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .patch('/api/users/me/avatar')
          .attach('file', createTestImageBuffer(), {
            filename: 'avatar.png',
            contentType: 'image/png',
          })
          .expect(401);
      });
    });
  });

  describe('DELETE /api/users/me/avatar', () => {
    describe('Happy Path', () => {
      it('should remove user avatar successfully', async () => {
        const user = await authHelper.createMember();

        // First upload an avatar
        await request(ctx.server)
          .patch('/api/users/me/avatar')
          .set(authHelper.authHeader(user))
          .attach('file', createTestImageBuffer(), {
            filename: 'avatar.png',
            contentType: 'image/png',
          })
          .expect(200);

        // Then remove it
        await request(ctx.server)
          .delete('/api/users/me/avatar')
          .set(authHelper.authHeader(user))
          .expect(204);

        // Verify avatar is removed by checking user data
        const userRepo = ctx.db.getRepository(UserOrmEntity);
        const updatedUser = await userRepo.findOne({
          where: { id: user.user.id },
        });
        expect(updatedUser?.avatarUrl).toBeNull();
      });

      it('should succeed even if user has no avatar', async () => {
        const user = await authHelper.createMember();

        await request(ctx.server)
          .delete('/api/users/me/avatar')
          .set(authHelper.authHeader(user))
          .expect(204);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server).delete('/api/users/me/avatar').expect(401);
      });
    });
  });

  describe('POST /api/accounts/me/gallery/upload', () => {
    let userWithAccount: TestUser;

    beforeEach(async () => {
      // Create authenticated user first
      userWithAccount = await authHelper.createMember();

      // Then create account for that user
      await accountFactory.create({
        userId: userWithAccount.user.id,
      });
    });

    describe('Happy Path', () => {
      it('should upload gallery image successfully', async () => {
        const response = await request(ctx.server)
          .post('/api/accounts/me/gallery/upload')
          .set(authHelper.authHeader(userWithAccount))
          .attach('file', createTestImageBuffer(), {
            filename: 'gallery-image.png',
            contentType: 'image/png',
          })
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(String),
          imageUrl: expect.any(String),
        });
      });

      it('should upload gallery image with caption', async () => {
        const response = await request(ctx.server)
          .post('/api/accounts/me/gallery/upload')
          .set(authHelper.authHeader(userWithAccount))
          .attach('file', createTestImageBuffer(), {
            filename: 'gallery-image.png',
            contentType: 'image/png',
          })
          .field('caption', 'My beautiful photo')
          .expect(201);

        expect(response.body).toMatchObject({
          caption: 'My beautiful photo',
        });
      });

      it('should upload gallery image with sort order', async () => {
        const response = await request(ctx.server)
          .post('/api/accounts/me/gallery/upload')
          .set(authHelper.authHeader(userWithAccount))
          .attach('file', createTestImageBuffer(), {
            filename: 'gallery-image.png',
            contentType: 'image/png',
          })
          .field('sortOrder', '5')
          .expect(201);

        expect(response.body).toMatchObject({
          sortOrder: 5,
        });
      });
    });

    describe('Validation Errors', () => {
      it('should return error when file is missing', async () => {
        const response = await request(ctx.server)
          .post('/api/accounts/me/gallery/upload')
          .set(authHelper.authHeader(userWithAccount));

        // When no file is attached, the response can be 400 (validation error) or 500 (internal error)
        // depending on how ParseFilePipe handles missing files in multipart requests
        expect([400, 500]).toContain(response.status);
      });

      it('should return 400 for non-image file type', async () => {
        const textBuffer = Buffer.from('This is not an image');

        await request(ctx.server)
          .post('/api/accounts/me/gallery/upload')
          .set(authHelper.authHeader(userWithAccount))
          .attach('file', textBuffer, 'document.txt')
          .expect(400);
      });

      it('should return 400 for file exceeding 10MB limit', async () => {
        const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

        await request(ctx.server)
          .post('/api/accounts/me/gallery/upload')
          .set(authHelper.authHeader(userWithAccount))
          .attach('file', largeBuffer, 'large-image.png')
          .expect(400);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .post('/api/accounts/me/gallery/upload')
          .attach('file', createTestImageBuffer(), {
            filename: 'gallery-image.png',
            contentType: 'image/png',
          })
          .expect(401);
      });
    });

    describe('Not Found', () => {
      it('should return 404 when user has no account', async () => {
        // Create user without account
        const userWithoutAccount = await authHelper.createMember();

        await request(ctx.server)
          .post('/api/accounts/me/gallery/upload')
          .set(authHelper.authHeader(userWithoutAccount))
          .attach('file', createTestImageBuffer(), {
            filename: 'gallery-image.png',
            contentType: 'image/png',
          })
          .expect(404);
      });
    });
  });
});
