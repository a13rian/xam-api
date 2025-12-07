import request from 'supertest';
import {
  TestContext,
  createTestApp,
  closeTestApp,
} from '../../support/test-app';
import { OrganizationFactory } from '../../support/factories/organization.factory';
import { UserFactory } from '../../support/factories/user.factory';

describe('POST /api/auth/register', () => {
  let ctx: TestContext;
  let orgFactory: OrganizationFactory;
  let userFactory: UserFactory;

  beforeAll(async () => {
    ctx = await createTestApp();
    orgFactory = new OrganizationFactory(ctx.db);
    userFactory = new UserFactory(ctx.db);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await ctx.db.cleanUsersAndOrganizations();
  });

  describe('Happy Path', () => {
    it('should register a new user successfully', async () => {
      const response = await request(ctx.server)
        .post('/api/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: 'newuser@test.com',
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should register user with organization', async () => {
      const admin = await userFactory.create({ roleNames: ['super_admin'] });
      const org = await orgFactory.create({ ownerId: admin.id });

      const response = await request(ctx.server)
        .post('/api/auth/register')
        .send({
          email: 'orguser@test.com',
          password: 'SecurePass123!',
          firstName: 'Jane',
          lastName: 'Doe',
          organizationId: org.id,
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid email format', async () => {
      const response = await request(ctx.server)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should return 400 for password too short', async () => {
      const response = await request(ctx.server)
        .post('/api/auth/register')
        .send({
          email: 'user@test.com',
          password: 'short',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(ctx.server)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should return 400 for firstName exceeding max length', async () => {
      await request(ctx.server)
        .post('/api/auth/register')
        .send({
          email: 'user@test.com',
          password: 'SecurePass123!',
          firstName: 'A'.repeat(101),
          lastName: 'Doe',
        })
        .expect(400);
    });

    it('should return 400 for lastName exceeding max length', async () => {
      await request(ctx.server)
        .post('/api/auth/register')
        .send({
          email: 'user@test.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'D'.repeat(101),
        })
        .expect(400);
    });

    it('should return 400 for invalid organizationId format', async () => {
      await request(ctx.server)
        .post('/api/auth/register')
        .send({
          email: 'user@test.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          organizationId: 'not-a-uuid',
        })
        .expect(400);
    });
  });

  describe('Conflict Errors', () => {
    it('should return 409 for duplicate email', async () => {
      await userFactory.create({ email: 'existing@test.com' });

      const response = await request(ctx.server)
        .post('/api/auth/register')
        .send({
          email: 'existing@test.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(409);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('Not Found Errors', () => {
    it('should return 404 for non-existent organizationId', async () => {
      await request(ctx.server)
        .post('/api/auth/register')
        .send({
          email: 'user@test.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          organizationId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(404);
    });
  });
});
