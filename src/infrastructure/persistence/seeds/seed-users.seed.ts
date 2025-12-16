import { DataSource } from 'typeorm';
import { UserOrmEntity } from '../typeorm/entities/user.orm-entity';
import { RoleOrmEntity } from '../typeorm/entities/role.orm-entity';
import * as bcrypt from 'bcrypt';
import {
  vietnameseFirstNames,
  vietnameseLastNames,
  getRandomElement,
} from './data/city-locations';

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = '123456a@';

// 10 normal users configuration
const normalUsers = [
  { email: 'user1@example.com', firstName: 'Minh', lastName: 'Nguyễn' },
  { email: 'user2@example.com', firstName: 'Lan', lastName: 'Trần' },
  { email: 'user3@example.com', firstName: 'Hùng', lastName: 'Lê' },
  { email: 'user4@example.com', firstName: 'Hương', lastName: 'Phạm' },
  { email: 'user5@example.com', firstName: 'Tuấn', lastName: 'Hoàng' },
  { email: 'user6@example.com', firstName: 'Thảo', lastName: 'Vũ' },
  { email: 'user7@example.com', firstName: 'Đức', lastName: 'Đặng' },
  { email: 'user8@example.com', firstName: 'Mai', lastName: 'Bùi' },
  { email: 'user9@example.com', firstName: 'Nam', lastName: 'Đỗ' },
  { email: 'user10@example.com', firstName: 'Linh', lastName: 'Hồ' },
];

export async function seedNormalUsers(
  dataSource: DataSource,
  roles: RoleOrmEntity[],
): Promise<UserOrmEntity[]> {
  const userRepository = dataSource.getRepository(UserOrmEntity);

  // Check if normal users already exist
  const existingUser = await userRepository.findOne({
    where: { email: 'user1@example.com' },
  });

  if (existingUser) {
    console.log('Normal users already seeded');
    const existingUsers = await userRepository.find({
      where: normalUsers.map((u) => ({ email: u.email })),
    });
    return existingUsers;
  }

  const memberRole = roles.find((r) => r.name === 'member');
  if (!memberRole) {
    throw new Error('Member role not found');
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  const userEntities = normalUsers.map((u) => {
    const entity = new UserOrmEntity();
    entity.email = u.email;
    entity.passwordHash = passwordHash;
    entity.firstName = u.firstName;
    entity.lastName = u.lastName;
    entity.isActive = true;
    entity.emailVerifiedAt = new Date();
    entity.failedLoginAttempts = 0;
    entity.lockedUntil = null;
    entity.roles = [memberRole];
    return entity;
  });

  await userRepository.save(userEntities);
  console.log(`Seeded ${userEntities.length} normal users`);

  return userRepository.find({
    where: normalUsers.map((u) => ({ email: u.email })),
    relations: ['roles'],
  });
}

export async function seedBulkUsers(
  dataSource: DataSource,
  roles: RoleOrmEntity[],
  count: number = 1000,
): Promise<UserOrmEntity[]> {
  const userRepository = dataSource.getRepository(UserOrmEntity);

  // Check if bulk users already exist
  const existingUser = await userRepository.findOne({
    where: { email: 'bulk_user_0@example.com' },
  });

  if (existingUser) {
    console.log('Bulk users already seeded');
    return userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.email LIKE :pattern', { pattern: 'bulk_user_%@example.com' })
      .getMany();
  }

  const memberRole = roles.find((r) => r.name === 'member');
  if (!memberRole) {
    throw new Error('Member role not found');
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  const userEntities: UserOrmEntity[] = [];
  for (let i = 0; i < count; i++) {
    const entity = new UserOrmEntity();
    entity.email = `bulk_user_${i}@example.com`;
    entity.passwordHash = passwordHash;
    entity.firstName = getRandomElement(vietnameseFirstNames);
    entity.lastName = getRandomElement(vietnameseLastNames);
    entity.isActive = true;
    entity.emailVerifiedAt = new Date();
    entity.failedLoginAttempts = 0;
    entity.lockedUntil = null;
    entity.roles = [memberRole];
    userEntities.push(entity);
  }

  // Batch insert for performance
  const BATCH_SIZE = 100;
  let seededCount = 0;
  for (let i = 0; i < userEntities.length; i += BATCH_SIZE) {
    const batch = userEntities.slice(i, i + BATCH_SIZE);
    await userRepository.save(batch);
    seededCount += batch.length;
    console.log(`Seeded ${seededCount}/${count} bulk users...`);
  }

  console.log(`Seeded ${count} bulk users`);

  return userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.roles', 'role')
    .where('user.email LIKE :pattern', { pattern: 'bulk_user_%@example.com' })
    .getMany();
}
