import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { AuthHelper } from '../../support/auth/auth.helper';
import { RoleFactory } from '../../support/factories/role.factory';
import { OrganizationFactory } from '../../support/factories/organization.factory';

describe('GET /api/roles', () => {
  let ctx: TestContext;
  let authHelper: AuthHelper;
  let roleFactory: RoleFactory;
  let orgFactory: OrganizationFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    authHelper = new AuthHelper(ctx);
    roleFactory = new RoleFactory(ctx.db);
    orgFactory = new OrganizationFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanUsersAndOrganizations();
  });

  describe('Happy Path', () => {
    it('should list all roles including system roles', async () => {
      const user = await authHelper.createAuthenticatedUser();

      const response = await request(ctx.server)
        .get('/api/roles')
        .set(authHelper.authHeader(user))
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      // Should have at least the system roles (super_admin, admin, member)
      expect(response.body.items.length).toBeGreaterThanOrEqual(3);
    });

    it('should include custom roles', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      await roleFactory.create({ name: 'custom-test-role' });

      const response = await request(ctx.server)
        .get('/api/roles')
        .set(authHelper.authHeader(superAdmin))
        .expect(200);

      const customRole = response.body.items.find(
        (r: { name: string }) => r.name === 'custom-test-role',
      );
      expect(customRole).toBeDefined();
    });

    it('should filter by organizationId', async () => {
      const superAdmin = await authHelper.createSuperAdmin();
      const org = await orgFactory.create({ ownerId: superAdmin.user.id });

      await roleFactory.create({
        name: 'org-specific-role',
        organizationId: org.id,
      });

      const response = await request(ctx.server)
        .get('/api/roles')
        .set(authHelper.authHeader(superAdmin))
        .query({ organizationId: org.id })
        .expect(200);

      expect(
        response.body.items.every(
          (r: { organizationId: string | null }) =>
            r.organizationId === org.id || r.organizationId === null,
        ),
      ).toBe(true);
    });

    it('should filter system roles', async () => {
      const user = await authHelper.createAuthenticatedUser();

      const response = await request(ctx.server)
        .get('/api/roles')
        .set(authHelper.authHeader(user))
        .query({ includeSystemRoles: true })
        .expect(200);

      const systemRoles = response.body.items.filter(
        (r: { isSystem: boolean }) => r.isSystem,
      );
      expect(systemRoles.length).toBeGreaterThan(0);
    });
  });

  describe('Unauthorized', () => {
    it('should return 401 without token', async () => {
      await request(ctx.server).get('/api/roles').expect(401);
    });
  });
});
