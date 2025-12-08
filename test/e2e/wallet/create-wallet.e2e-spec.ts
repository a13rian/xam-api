import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';

describe('POST /api/wallet/me', () => {
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
    await ctx.db.cleanAllData();
  });

  describe('Happy Path', () => {
    it('should create wallet for authenticated user', async () => {
      const user = await authHelper.createAuthenticatedUser();

      const response = await request(ctx.server)
        .post('/api/wallet/me')
        .set(authHelper.authHeader(user))
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        userId: user.user.id,
        balance: 0,
        currency: 'VND',
      });
    });
  });

  describe('Conflict', () => {
    it('should return 409 if wallet already exists', async () => {
      const user = await authHelper.createAuthenticatedUser();

      // Create wallet first
      await request(ctx.server)
        .post('/api/wallet/me')
        .set(authHelper.authHeader(user))
        .expect(201);

      // Try to create again
      await request(ctx.server)
        .post('/api/wallet/me')
        .set(authHelper.authHeader(user))
        .expect(409);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server).post('/api/wallet/me').expect(401);
    });
  });
});
