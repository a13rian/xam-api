import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { DatabaseHelper } from '../database/database.helper';
import { UserOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/user.orm-entity';
import { RoleOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/role.orm-entity';

export interface CreateUserOptions {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
  roleNames?: string[];
  isActive?: boolean;
  emailVerifiedAt?: Date | null;
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
}

export interface CreatedUser {
  id: string;
  email: string;
  password: string; // Plain text for login
  firstName: string;
  lastName: string;
  organizationId: string | null;
  roleIds: string[];
}

let userCounter = 0;

export class UserFactory {
  constructor(private readonly db: DatabaseHelper) {}

  async create(options: CreateUserOptions = {}): Promise<CreatedUser> {
    userCounter++;
    const password = options.password || 'TestPassword123!';
    const passwordHash = await bcrypt.hash(password, 10);

    const userRepo = this.db.getRepository(UserOrmEntity);
    const roleRepo = this.db.getRepository(RoleOrmEntity);

    // Get roles by name
    const roleNames = options.roleNames || ['member'];
    const roles: RoleOrmEntity[] = [];

    for (const name of roleNames) {
      const role = await roleRepo.findOne({ where: { name } });
      if (role) {
        roles.push(role);
      }
    }

    const user = userRepo.create({
      id: uuidv4(),
      email: options.email || `test-user-${userCounter}-${Date.now()}@test.com`,
      passwordHash,
      firstName: options.firstName || `Test${userCounter}`,
      lastName: options.lastName || 'User',
      organizationId: options.organizationId || null,
      isActive: options.isActive ?? true,
      emailVerifiedAt: options.emailVerifiedAt ?? new Date(),
      failedLoginAttempts: options.failedLoginAttempts ?? 0,
      lockedUntil: options.lockedUntil ?? null,
      roles,
    });

    await userRepo.save(user);

    return {
      id: user.id,
      email: user.email,
      password,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organizationId,
      roleIds: roles.map((r) => r.id),
    };
  }

  async createUnverified(
    options: CreateUserOptions = {},
  ): Promise<CreatedUser> {
    return this.create({
      ...options,
      emailVerifiedAt: null,
    });
  }

  async createLocked(
    lockedUntil: Date,
    options: CreateUserOptions = {},
  ): Promise<CreatedUser> {
    return this.create({
      ...options,
      lockedUntil,
      failedLoginAttempts: 5,
    });
  }

  async createInactive(options: CreateUserOptions = {}): Promise<CreatedUser> {
    return this.create({
      ...options,
      isActive: false,
    });
  }
}
