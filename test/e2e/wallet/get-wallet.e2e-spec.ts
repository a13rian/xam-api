import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { WalletFactory } from '../../support/factories/wallet.factory';

describe('GET /api/wallet/me', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let walletFactory: WalletFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    walletFactory = new WalletFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanAllData();
  });

  describe('Happy Path', () => {
    it('should return wallet for authenticated user', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const wallet = await walletFactory.create({ userId: user.user.id });

      const response = await request(ctx.server)
        .get('/api/wallet/me')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body).toMatchObject({
        id: wallet.id,
        userId: user.user.id,
        balance: 0,
        currency: 'VND',
      });
    });

    it('should return wallet with balance', async () => {
      const user = await authHelper.createAuthenticatedUser();
      await walletFactory.createWithBalance(user.user.id, 500000);

      const response = await request(ctx.server)
        .get('/api/wallet/me')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body.balance).toBe(500000);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if wallet does not exist', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .get('/api/wallet/me')
        .set(authHelper.authHeader(user))
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server).get('/api/wallet/me').expect(401);
    });
  });
});
