/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { TestContext, createTestApp, closeTestApp } from '../support/test-app';
import { AccountFactory } from '../support/factories/account.factory';
import { AccountTypeEnum } from '../../src/core/domain/account/value-objects/account-type.vo';
import { AccountStatusEnum } from '../../src/core/domain/account/value-objects/account-status.vo';

describe('Account Search E2E', () => {
  let ctx: TestContext;
  let accountFactory: AccountFactory;

  // Test coordinates (Ho Chi Minh City center - District 1)
  const centerLat = 10.7769;
  const centerLng = 106.7009;

  beforeAll(async () => {
    ctx = await createTestApp();
    accountFactory = new AccountFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanAllData();
  });

  describe('GET /api/accounts/search', () => {
    describe('Happy Path', () => {
      it('should search accounts by location (public endpoint)', async () => {
        // Create accounts at different distances from center
        await accountFactory.createWithLocation(10.776, 106.7007, {
          displayName: 'Near Account',
          district: 'Quận 1',
          city: 'Thành phố Hồ Chí Minh',
        });

        await accountFactory.createWithLocation(10.785, 106.69, {
          displayName: 'Far Account',
          district: 'Quận 3',
          city: 'Thành phố Hồ Chí Minh',
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
          })
          .expect(200);

        expect(response.body.items).toHaveLength(2);
        expect(response.body.total).toBe(2);
        expect(response.body.page).toBe(1);
        expect(response.body.limit).toBe(20);
        expect(response.body.totalPages).toBe(1);
      });

      it('should return accounts sorted by distance (closest first)', async () => {
        // Create account far from center (~1.5km)
        await accountFactory.createWithLocation(10.79, 106.69, {
          displayName: 'Far Account',
        });

        // Create account very close to center (~100m)
        await accountFactory.createWithLocation(10.777, 106.701, {
          displayName: 'Near Account',
        });

        // Create account medium distance (~500m)
        await accountFactory.createWithLocation(10.78, 106.705, {
          displayName: 'Medium Account',
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
          })
          .expect(200);

        expect(response.body.items).toHaveLength(3);
        // First item should be the closest
        expect(response.body.items[0].displayName).toBe('Near Account');
        expect(response.body.items[0].distanceKm).toBeLessThan(0.2);
        // Distance should be increasing
        expect(response.body.items[0].distanceKm).toBeLessThan(
          response.body.items[1].distanceKm,
        );
        expect(response.body.items[1].distanceKm).toBeLessThan(
          response.body.items[2].distanceKm,
        );
      });

      it('should include distance in response', async () => {
        await accountFactory.createWithLocation(10.78, 106.705, {
          displayName: 'Test Account',
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
          })
          .expect(200);

        expect(response.body.items[0]).toHaveProperty('distanceKm');
        expect(typeof response.body.items[0].distanceKm).toBe('number');
        expect(response.body.items[0].distanceKm).toBeGreaterThan(0);
      });

      it('should return correct account fields', async () => {
        await accountFactory.createWithLocation(10.776, 106.7007, {
          displayName: 'Test Account',
          type: AccountTypeEnum.INDIVIDUAL,
          status: AccountStatusEnum.ACTIVE,
          street: '123 Nguyen Hue',
          ward: 'Ben Nghe',
          district: 'Quan 1',
          city: 'Ho Chi Minh City',
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
          })
          .expect(200);

        expect(response.body.items[0]).toMatchObject({
          id: expect.stringMatching(/^acc_/),
          displayName: 'Test Account',
          type: 'individual',
          status: 'active',
          street: '123 Nguyen Hue',
          ward: 'Ben Nghe',
          district: 'Quan 1',
          city: 'Ho Chi Minh City',
          latitude: expect.any(Number),
          longitude: expect.any(Number),
          distanceKm: expect.any(Number),
        });
      });

      it('should filter by radius', async () => {
        // Create account at ~500m from center
        await accountFactory.createWithLocation(10.78, 106.705, {
          displayName: 'Close Account',
        });

        // Create account at ~3km from center
        await accountFactory.createWithLocation(10.8, 106.73, {
          displayName: 'Far Account',
        });

        // Search with 1km radius - should only find close account
        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 1,
          })
          .expect(200);

        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].displayName).toBe('Close Account');
      });

      it('should filter by search term (displayName)', async () => {
        await accountFactory.createWithLocation(10.776, 106.7007, {
          displayName: 'Nguyen Spa',
        });

        await accountFactory.createWithLocation(10.777, 106.701, {
          displayName: 'Tran Beauty',
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
            search: 'Nguyen',
          })
          .expect(200);

        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].displayName).toBe('Nguyen Spa');
      });

      it('should filter by district', async () => {
        await accountFactory.createWithLocation(10.776, 106.7007, {
          displayName: 'District 1 Account',
          district: 'Quan 1',
        });

        await accountFactory.createWithLocation(10.777, 106.701, {
          displayName: 'District 3 Account',
          district: 'Quan 3',
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
            district: 'Quan 1',
          })
          .expect(200);

        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].displayName).toBe('District 1 Account');
      });

      it('should filter by city', async () => {
        await accountFactory.createWithLocation(10.776, 106.7007, {
          displayName: 'HCM Account',
          city: 'Ho Chi Minh City',
        });

        await accountFactory.createWithLocation(10.777, 106.701, {
          displayName: 'Hanoi Account',
          city: 'Hanoi',
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
            city: 'Ho Chi Minh City',
          })
          .expect(200);

        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].displayName).toBe('HCM Account');
      });

      it('should filter by ward', async () => {
        await accountFactory.createWithLocation(10.776, 106.7007, {
          displayName: 'Ben Nghe Account',
          ward: 'Ben Nghe',
        });

        await accountFactory.createWithLocation(10.777, 106.701, {
          displayName: 'Other Ward Account',
          ward: 'Da Kao',
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
            ward: 'Ben Nghe',
          })
          .expect(200);

        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].displayName).toBe('Ben Nghe Account');
      });

      it('should combine multiple filters', async () => {
        await accountFactory.createWithLocation(10.776, 106.7007, {
          displayName: 'Target Spa',
          district: 'Quan 1',
          city: 'Ho Chi Minh City',
        });

        await accountFactory.createWithLocation(10.777, 106.701, {
          displayName: 'Target Beauty',
          district: 'Quan 3',
          city: 'Ho Chi Minh City',
        });

        await accountFactory.createWithLocation(10.778, 106.702, {
          displayName: 'Other Spa',
          district: 'Quan 1',
          city: 'Ho Chi Minh City',
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
            search: 'Spa',
            district: 'Quan 1',
          })
          .expect(200);

        expect(response.body.items).toHaveLength(2);
        response.body.items.forEach((item: { displayName: string }) => {
          expect(item.displayName).toContain('Spa');
        });
      });

      it('should support pagination', async () => {
        // Create 5 accounts
        for (let i = 0; i < 5; i++) {
          await accountFactory.createWithLocation(
            10.776 + i * 0.001,
            106.7007,
            { displayName: `Account ${i + 1}` },
          );
        }

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
            page: 2,
            limit: 2,
          })
          .expect(200);

        expect(response.body.items).toHaveLength(2);
        expect(response.body.total).toBe(5);
        expect(response.body.page).toBe(2);
        expect(response.body.limit).toBe(2);
        expect(response.body.totalPages).toBe(3);
      });

      it('should use default radius when not specified', async () => {
        // Create account within default 10km radius
        await accountFactory.createWithLocation(10.776, 106.7007, {
          displayName: 'Near Account',
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
          })
          .expect(200);

        expect(response.body.items).toHaveLength(1);
      });
    });

    describe('Filtering Logic', () => {
      it('should only return active accounts', async () => {
        await accountFactory.createWithLocation(10.776, 106.7007, {
          displayName: 'Active Account',
          isActive: true,
        });

        await accountFactory.createInactive({
          displayName: 'Inactive Account',
          latitude: 10.777,
          longitude: 106.701,
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
          })
          .expect(200);

        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].displayName).toBe('Active Account');
      });

      it('should only return accounts with location', async () => {
        await accountFactory.createWithLocation(10.776, 106.7007, {
          displayName: 'With Location',
        });

        // Account without location
        await accountFactory.create({
          displayName: 'Without Location',
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
          })
          .expect(200);

        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].displayName).toBe('With Location');
      });

      it('should return both individual and business accounts', async () => {
        await accountFactory.createWithLocation(10.776, 106.7007, {
          displayName: 'Individual Account',
          type: AccountTypeEnum.INDIVIDUAL,
        });

        await accountFactory.createWithLocation(10.777, 106.701, {
          displayName: 'Business Account',
          type: AccountTypeEnum.BUSINESS,
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
          })
          .expect(200);

        expect(response.body.items).toHaveLength(2);
        const types = response.body.items.map(
          (item: { type: string }) => item.type,
        );
        expect(types).toContain('individual');
        expect(types).toContain('business');
      });
    });

    describe('Edge Cases', () => {
      it('should return empty result when no accounts in radius', async () => {
        // Create account far away (~50km)
        await accountFactory.createWithLocation(11.0, 107.0, {
          displayName: 'Far Away Account',
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 5,
          })
          .expect(200);

        expect(response.body.items).toHaveLength(0);
        expect(response.body.total).toBe(0);
        expect(response.body.totalPages).toBe(0);
      });

      it('should return empty result when no accounts match filters', async () => {
        await accountFactory.createWithLocation(10.776, 106.7007, {
          displayName: 'Test Account',
          district: 'Quan 1',
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
            district: 'Nonexistent District',
          })
          .expect(200);

        expect(response.body.items).toHaveLength(0);
        expect(response.body.total).toBe(0);
      });

      it('should handle search with special characters', async () => {
        await accountFactory.createWithLocation(10.776, 106.7007, {
          displayName: "O'Brien's Salon",
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
            search: "O'Brien",
          })
          .expect(200);

        expect(response.body.items).toHaveLength(1);
      });

      it('should handle case-insensitive search', async () => {
        await accountFactory.createWithLocation(10.776, 106.7007, {
          displayName: 'Beauty Salon',
        });

        const response = await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 10,
            search: 'beauty',
          })
          .expect(200);

        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].displayName).toBe('Beauty Salon');
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for missing latitude', async () => {
        await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            longitude: centerLng,
            radiusKm: 10,
          })
          .expect(400);
      });

      it('should return 400 for missing longitude', async () => {
        await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            radiusKm: 10,
          })
          .expect(400);
      });

      it('should return 400 for invalid latitude (non-number)', async () => {
        await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: 'invalid',
            longitude: centerLng,
            radiusKm: 10,
          })
          .expect(400);
      });

      it('should return 400 for invalid longitude (non-number)', async () => {
        await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: 'invalid',
            radiusKm: 10,
          })
          .expect(400);
      });

      it('should return 400 for radius exceeding maximum (50km)', async () => {
        await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 100,
          })
          .expect(400);
      });

      it('should return 400 for radius below minimum', async () => {
        await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            radiusKm: 0,
          })
          .expect(400);
      });

      it('should return 400 for page below 1', async () => {
        await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            page: 0,
          })
          .expect(400);
      });

      it('should return 400 for limit exceeding maximum (100)', async () => {
        await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            limit: 200,
          })
          .expect(400);
      });

      it('should return 400 for limit below 1', async () => {
        await request(ctx.server)
          .get('/api/accounts/search')
          .query({
            latitude: centerLat,
            longitude: centerLng,
            limit: 0,
          })
          .expect(400);
      });
    });
  });
});
