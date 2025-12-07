import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { OrganizationFactory } from '../../support/factories/organization.factory';

describe('PATCH /api/organizations/:id', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let orgFactory: OrganizationFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    orgFactory = new OrganizationFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanUsersAndOrganizations();
  });

  describe('Happy Path', () => {
    it('should update organization name', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const org = await orgFactory.create({
        name: 'Original Name',
        ownerId: user.user.id,
      });

      const response = await request(ctx.server)
        .patch(`/api/organizations/${org.id}`)
        .set(authHelper.authHeader(user))
        .send({
          name: 'Updated Name',
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
    });

    it('should update organization description', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const org = await orgFactory.create({
        ownerId: user.user.id,
      });

      const response = await request(ctx.server)
        .patch(`/api/organizations/${org.id}`)
        .set(authHelper.authHeader(user))
        .send({
          description: 'New description',
        })
        .expect(200);

      expect(response.body.description).toBe('New description');
    });

    it('should deactivate organization', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const org = await orgFactory.create({
        ownerId: user.user.id,
      });

      const response = await request(ctx.server)
        .patch(`/api/organizations/${org.id}`)
        .set(authHelper.authHeader(user))
        .send({
          isActive: false,
        })
        .expect(200);

      expect(response.body.isActive).toBe(false);
    });

    it('should allow partial update', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const org = await orgFactory.create({
        name: 'Original',
        description: 'Original desc',
        ownerId: user.user.id,
      });

      const response = await request(ctx.server)
        .patch(`/api/organizations/${org.id}`)
        .set(authHelper.authHeader(user))
        .send({
          name: 'Updated',
        })
        .expect(200);

      expect(response.body.name).toBe('Updated');
      expect(response.body.description).toBe('Original desc');
    });
  });

  describe('Not Found', () => {
    it('should return 404 for non-existent organization', async () => {
      const user = await authHelper.createAuthenticatedUser();

      await request(ctx.server)
        .patch('/api/organizations/00000000-0000-0000-0000-000000000000')
        .set(authHelper.authHeader(user))
        .send({
          name: 'Updated',
        })
        .expect(404);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for name too long', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const org = await orgFactory.create({ ownerId: user.user.id });

      await request(ctx.server)
        .patch(`/api/organizations/${org.id}`)
        .set(authHelper.authHeader(user))
        .send({
          name: 'A'.repeat(201),
        })
        .expect(400);
    });

    it('should return 400 for description too long', async () => {
      const user = await authHelper.createAuthenticatedUser();
      const org = await orgFactory.create({ ownerId: user.user.id });

      await request(ctx.server)
        .patch(`/api/organizations/${org.id}`)
        .set(authHelper.authHeader(user))
        .send({
          description: 'A'.repeat(1001),
        })
        .expect(400);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      const user = await authHelper.createUser();
      const org = await orgFactory.create({ ownerId: user.id });

      await request(ctx.server)
        .patch(`/api/organizations/${org.id}`)
        .send({
          name: 'Updated',
        })
        .expect(401);
    });
  });
});
