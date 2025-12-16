import { DataSource } from 'typeorm';
import { UserOrmEntity } from '../typeorm/entities/user.orm-entity';
import { RoleOrmEntity } from '../typeorm/entities/role.orm-entity';
import * as bcrypt from 'bcrypt';

interface UserSeedConfig {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleName: string;
}

const users: UserSeedConfig[] = [
  {
    email: 'superadmin@xam.com',
    password: '123456a@',
    firstName: 'Super',
    lastName: 'Admin',
    roleName: 'super_admin',
  },
  {
    email: 'admin@xam.com',
    password: '123456a@',
    firstName: 'Admin',
    lastName: 'User',
    roleName: 'admin',
  },
  {
    email: 'member@xam.com',
    password: '123456a@',
    firstName: 'Member',
    lastName: 'User',
    roleName: 'member',
  },
];

export async function seedUsers(
  dataSource: DataSource,
  roles: RoleOrmEntity[],
): Promise<UserOrmEntity[]> {
  const userRepository = dataSource.getRepository(UserOrmEntity);
  const existingUsers = await userRepository.find();

  if (existingUsers.length > 0) {
    console.log('Users already seeded');
    return existingUsers;
  }

  const userEntities: UserOrmEntity[] = [];

  for (const userConfig of users) {
    const passwordHash = await bcrypt.hash(userConfig.password, 12);
    const role = roles.find((r) => r.name === userConfig.roleName);

    const entity = new UserOrmEntity();
    entity.email = userConfig.email;
    entity.passwordHash = passwordHash;
    entity.firstName = userConfig.firstName;
    entity.lastName = userConfig.lastName;
    entity.isActive = true;
    entity.emailVerifiedAt = new Date();
    entity.failedLoginAttempts = 0;
    entity.lockedUntil = null;
    entity.roles = role ? [role] : [];
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    userEntities.push(entity);
  }

  await userRepository.save(userEntities);
  console.log(`Seeded ${userEntities.length} users`);

  return userEntities;
}
