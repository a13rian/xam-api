import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { PartnerFactory } from '../../support/factories/partner.factory';
import { CategoryFactory } from '../../support/factories/category.factory';
import { ServiceFactory } from '../../support/factories/service.factory';
import { PartnerStaffFactory } from '../../support/factories/partner-staff.factory';

describe('PUT /api/partners/me/services/:id', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let partnerFactory: PartnerFactory;
  let categoryFactory: CategoryFactory;
  let serviceFactory: ServiceFactory;
  let partnerStaffFactory: PartnerStaffFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    partnerFactory = new PartnerFactory(ctx.db);
    categoryFactory = new CategoryFactory(ctx.db);
    serviceFactory = new ServiceFactory(ctx.db);
    partnerStaffFactory = new PartnerStaffFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanAllData();
  });

  describe('Happy Path', () => {
    it('should update service name', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );
      const category = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });
      const service = await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        name: 'Original Name',
      });

      const response = await request(ctx.server)
        .put(`/api/partners/me/services/${service.id}`)
        .set(authHelper.authHeader(user))
        .send({
          name: 'Updated Name',
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
    });

    it('should update service price', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );
      const category = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });
      const service = await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        priceAmount: 100000,
      });

      const response = await request(ctx.server)
        .put(`/api/partners/me/services/${service.id}`)
        .set(authHelper.authHeader(user))
        .send({
          price: 200000,
        })
        .expect(200);

      expect(response.body.price).toBe(200000);
    });

    it('should update service description', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );
      const category = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });
      const service = await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
      });

      const response = await request(ctx.server)
        .put(`/api/partners/me/services/${service.id}`)
        .set(authHelper.authHeader(user))
        .send({
          description: 'New detailed description',
        })
        .expect(200);

      expect(response.body.description).toBe('New detailed description');
    });

    it('should update service duration', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );
      const category = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });
      const service = await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
        durationMinutes: 30,
      });

      const response = await request(ctx.server)
        .put(`/api/partners/me/services/${service.id}`)
        .set(authHelper.authHeader(user))
        .send({
          durationMinutes: 60,
        })
        .expect(200);

      expect(response.body.durationMinutes).toBe(60);
    });

    it('should update service category', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );
      const category1 = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });
      const category2 = await categoryFactory.create({
        name: 'Spa',
        slug: 'spa',
      });
      const service = await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category1.id,
      });

      const response = await request(ctx.server)
        .put(`/api/partners/me/services/${service.id}`)
        .set(authHelper.authHeader(user))
        .send({
          categoryId: category2.id,
        })
        .expect(200);

      expect(response.body.categoryId).toBe(category2.id);
    });

    it('should update multiple fields at once', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );
      const category = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });
      const service = await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
      });

      const response = await request(ctx.server)
        .put(`/api/partners/me/services/${service.id}`)
        .set(authHelper.authHeader(user))
        .send({
          name: 'Premium Haircut',
          price: 300000,
          durationMinutes: 45,
          description: 'Premium haircut service',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'Premium Haircut',
        price: 300000,
        durationMinutes: 45,
        description: 'Premium haircut service',
      });
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for negative price', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );
      const category = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });
      const service = await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
      });

      await request(ctx.server)
        .put(`/api/partners/me/services/${service.id}`)
        .set(authHelper.authHeader(user))
        .send({
          price: -100,
        })
        .expect(400);
    });

    it('should return 400 for invalid duration', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );
      const category = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });
      const service = await serviceFactory.create({
        partnerId: partner.id,
        categoryId: category.id,
      });

      await request(ctx.server)
        .put(`/api/partners/me/services/${service.id}`)
        .set(authHelper.authHeader(user))
        .send({
          durationMinutes: 0,
        })
        .expect(400);
    });

    it('should return 400 for invalid UUID', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );

      await request(ctx.server)
        .put('/api/partners/me/services/invalid-uuid')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Updated Name',
        })
        .expect(400);
    });
  });

  describe('Not Found', () => {
    it('should return 404 if user has no partner profile', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .put('/api/partners/me/services/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Updated Name',
        })
        .expect(404);
    });

    it('should return 404 if service does not exist', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const partner = await partnerFactory.createActive({
        userId: user.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner.id,
        user.user.id,
        user.user.email,
      );

      await request(ctx.server)
        .put('/api/partners/me/services/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Updated Name',
        })
        .expect(404);
    });

    it('should return 404 if service belongs to another partner', async () => {
      const user1 = await authHelper.createAuthenticatedUser();
      const partner1 = await partnerFactory.createActive({
        userId: user1.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner1.id,
        user1.user.id,
        user1.user.email,
      );

      const user2 = await authHelper.createAuthenticatedUser();
      const partner2 = await partnerFactory.createActive({
        userId: user2.user.id,
      });
      await partnerStaffFactory.createOwner(
        partner2.id,
        user2.user.id,
        user2.user.email,
      );

      const category = await categoryFactory.create({
        name: 'Beauty',
        slug: 'beauty',
      });
      const service = await serviceFactory.create({
        partnerId: partner2.id,
        categoryId: category.id,
      });

      await request(ctx.server)
        .put(`/api/partners/me/services/${service.id}`)
        .set(authHelper.authHeader(user1))
        .send({
          name: 'Updated Name',
        })
        .expect(404);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server)
        .put('/api/partners/me/services/00000000-0000-0000-0000-000000000000')
        .send({
          name: 'Updated Name',
        })
        .expect(401);
    });
  });
});
