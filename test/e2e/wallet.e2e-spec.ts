/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AuthHelper } from '../support/auth/auth.helper';
import { WalletFactory } from '../support/factories/wallet.factory';

describe('Wallet E2E', () => {
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

  describe('POST /api/wallet/me', () => {
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

  describe('GET /api/wallet/me', () => {
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

  describe('POST /api/wallet/me/deposit', () => {
    describe('Happy Path', () => {
      it('should deposit money to wallet', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await walletFactory.create({ userId: user.user.id });

        const response = await request(ctx.server)
          .post('/api/wallet/me/deposit')
          .set(authHelper.authHeader(user))
          .send({
            amount: 100000,
            description: 'Test deposit',
          })
          .expect(200);

        expect(response.body).toMatchObject({
          balance: 100000,
        });
      });

      it('should accumulate deposits', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await walletFactory.create({ userId: user.user.id });

        await request(ctx.server)
          .post('/api/wallet/me/deposit')
          .set(authHelper.authHeader(user))
          .send({ amount: 100000, description: 'First deposit' })
          .expect(200);

        const response = await request(ctx.server)
          .post('/api/wallet/me/deposit')
          .set(authHelper.authHeader(user))
          .send({ amount: 50000, description: 'Second deposit' })
          .expect(200);

        expect(response.body.balance).toBe(150000);
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for zero amount', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await walletFactory.create({ userId: user.user.id });

        await request(ctx.server)
          .post('/api/wallet/me/deposit')
          .set(authHelper.authHeader(user))
          .send({
            amount: 0,
            description: 'Invalid deposit',
          })
          .expect(400);
      });

      it('should return 400 for negative amount', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await walletFactory.create({ userId: user.user.id });

        await request(ctx.server)
          .post('/api/wallet/me/deposit')
          .set(authHelper.authHeader(user))
          .send({
            amount: -100,
            description: 'Invalid deposit',
          })
          .expect(400);
      });

      it('should return 400 for missing amount', async () => {
        const user = await authHelper.createAuthenticatedUser();
        await walletFactory.create({ userId: user.user.id });

        await request(ctx.server)
          .post('/api/wallet/me/deposit')
          .set(authHelper.authHeader(user))
          .send({
            description: 'No amount',
          })
          .expect(400);
      });
    });

    describe('Not Found', () => {
      it('should return 404 if wallet does not exist', async () => {
        const user = await authHelper.createAuthenticatedUser();

        await request(ctx.server)
          .post('/api/wallet/me/deposit')
          .set(authHelper.authHeader(user))
          .send({
            amount: 100000,
            description: 'Test deposit',
          })
          .expect(404);
      });
    });

    describe('Unauthorized', () => {
      it('should return 401 without token', async () => {
        await request(ctx.server)
          .post('/api/wallet/me/deposit')
          .send({
            amount: 100000,
            description: 'Test deposit',
          })
          .expect(401);
      });
    });
  });
});
