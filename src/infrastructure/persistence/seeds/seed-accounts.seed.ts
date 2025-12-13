import { DataSource } from 'typeorm';
import { AccountOrmEntity } from '../typeorm/entities/account.orm-entity';
import { UserOrmEntity } from '../typeorm/entities/user.orm-entity';
import { OrganizationOrmEntity } from '../typeorm/entities/organization.orm-entity';
import { AccountTypeEnum } from '../../../core/domain/account/value-objects/account-type.vo';
import { AccountRoleEnum } from '../../../core/domain/account/value-objects/account-role.vo';
import { AccountStatusEnum } from '../../../core/domain/account/value-objects/account-status.vo';
import {
  hcmData,
  hanoiData,
  danangData,
  getRandomElement,
  getRandomOffset,
  getRandomStreetNumber,
  CityData,
} from './data/city-locations';

// Distribution constants
const PERSONAL_ACCOUNTS = 700;
const STAFF_ACCOUNTS = 300; // 100 owners + 200 staff (2 per org)

function getCityByIndex(index: number, total: number): CityData {
  // 40% HCM, 35% Ha Noi, 25% Da Nang
  const hcmThreshold = Math.floor(total * 0.4);
  const hanoiThreshold = Math.floor(total * 0.75);

  if (index < hcmThreshold) return hcmData;
  if (index < hanoiThreshold) return hanoiData;
  return danangData;
}

function generateDisplayName(user: UserOrmEntity): string {
  return `${user.lastName} ${user.firstName}`;
}

export async function seedAccountsWithLocations(
  dataSource: DataSource,
  users: UserOrmEntity[],
  organizations: OrganizationOrmEntity[],
): Promise<AccountOrmEntity[]> {
  const accountRepository = dataSource.getRepository(AccountOrmEntity);

  // Check if bulk accounts already exist
  const existingBulkAccount = await accountRepository
    .createQueryBuilder('account')
    .innerJoin('account.user', 'user')
    .where('user.email LIKE :pattern', { pattern: 'bulk_user_%@example.com' })
    .getOne();

  if (existingBulkAccount) {
    console.log('Accounts with locations already seeded');
    return accountRepository.find();
  }

  // We need 1000 users for accounts
  // users array should contain: 3 system users + 10 normal users + 1000 bulk users
  const bulkUsers = users.filter((u) => u.email.startsWith('bulk_user_'));

  if (bulkUsers.length < 1000) {
    console.log(
      `Warning: Only ${bulkUsers.length} bulk users available, need 1000`,
    );
  }

  const allAccounts: AccountOrmEntity[] = [];

  // Create 300 staff accounts (linked to organizations)
  // 100 owners (1 per org) + 200 staff (2 per org)
  console.log('Creating staff accounts...');
  let userIndex = 0;

  for (
    let orgIndex = 0;
    orgIndex < organizations.length && userIndex < STAFF_ACCOUNTS;
    orgIndex++
  ) {
    const org = organizations[orgIndex];
    const city = getCityForOrgIndex(orgIndex);

    // Create owner account
    if (userIndex < bulkUsers.length) {
      const ownerAccount = createStaffAccount(
        bulkUsers[userIndex],
        org,
        AccountRoleEnum.OWNER,
        city,
      );
      allAccounts.push(ownerAccount);
      userIndex++;
    }

    // Create 2 staff accounts per org
    for (
      let staffNum = 0;
      staffNum < 2 &&
      userIndex < STAFF_ACCOUNTS &&
      userIndex < bulkUsers.length;
      staffNum++
    ) {
      const staffAccount = createStaffAccount(
        bulkUsers[userIndex],
        org,
        AccountRoleEnum.MEMBER,
        city,
      );
      allAccounts.push(staffAccount);
      userIndex++;
    }
  }

  console.log(`Created ${allAccounts.length} staff accounts`);

  // Create 700 personal accounts (no organization)
  console.log('Creating personal accounts...');
  const personalStartIndex = userIndex;
  const personalEndIndex = Math.min(
    personalStartIndex + PERSONAL_ACCOUNTS,
    bulkUsers.length,
  );

  for (let i = personalStartIndex; i < personalEndIndex; i++) {
    const city = getCityByIndex(i - personalStartIndex, PERSONAL_ACCOUNTS);
    const personalAccount = createPersonalAccount(bulkUsers[i], city);
    allAccounts.push(personalAccount);
  }

  console.log(
    `Created ${allAccounts.length - userIndex + personalStartIndex} personal accounts`,
  );

  // Batch save accounts
  const BATCH_SIZE = 100;
  let seededCount = 0;
  for (let i = 0; i < allAccounts.length; i += BATCH_SIZE) {
    const batch = allAccounts.slice(i, i + BATCH_SIZE);
    await accountRepository.save(batch);
    seededCount += batch.length;
    console.log(`Seeded ${seededCount}/${allAccounts.length} accounts...`);
  }

  console.log(`Seeded ${allAccounts.length} accounts with locations`);

  return allAccounts;
}

function getCityForOrgIndex(index: number): CityData {
  // Match org distribution: 40 HCM, 35 Ha Noi, 25 Da Nang
  if (index < 40) return hcmData;
  if (index < 75) return hanoiData;
  return danangData;
}

function createStaffAccount(
  user: UserOrmEntity,
  org: OrganizationOrmEntity,
  role: AccountRoleEnum,
  city: CityData,
): AccountOrmEntity {
  const district = getRandomElement(city.districts);
  const street = getRandomElement(district.streets);
  const ward = getRandomElement(district.wards);
  const streetNumber = getRandomStreetNumber();

  const latitude = district.latitude + getRandomOffset();
  const longitude = district.longitude + getRandomOffset();

  const account = new AccountOrmEntity();
  account.userId = user.id;
  account.organizationId = org.id;
  account.type = AccountTypeEnum.BUSINESS;
  account.role = role;
  account.displayName = generateDisplayName(user);
  account.status = AccountStatusEnum.ACTIVE;
  account.isActive = true;
  account.approvedAt = new Date();

  // Location fields
  account.street = `${streetNumber} ${street}`;
  account.ward = ward;
  account.district = district.name;
  account.city = city.name;
  account.latitude = latitude;
  account.longitude = longitude;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (account as any).location = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };

  // Optional fields
  account.specialization = null;
  account.yearsExperience = null;
  account.certifications = [];
  account.portfolio = null;
  account.personalBio = null;
  account.invitationStatus = null;
  account.invitationToken = null;
  account.invitedAt = null;
  account.acceptedAt = null;
  account.approvedBy = null;
  account.rejectionReason = null;

  return account;
}

function createPersonalAccount(
  user: UserOrmEntity,
  city: CityData,
): AccountOrmEntity {
  const district = getRandomElement(city.districts);
  const street = getRandomElement(district.streets);
  const ward = getRandomElement(district.wards);
  const streetNumber = getRandomStreetNumber();

  const latitude = district.latitude + getRandomOffset();
  const longitude = district.longitude + getRandomOffset();

  const account = new AccountOrmEntity();
  account.userId = user.id;
  account.organizationId = null;
  account.type = AccountTypeEnum.INDIVIDUAL;
  account.role = null;
  account.displayName = generateDisplayName(user);
  account.status = AccountStatusEnum.ACTIVE;
  account.isActive = true;
  account.approvedAt = new Date();

  // Location fields
  account.street = `${streetNumber} ${street}`;
  account.ward = ward;
  account.district = district.name;
  account.city = city.name;
  account.latitude = latitude;
  account.longitude = longitude;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (account as any).location = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };

  // Optional fields
  account.specialization = null;
  account.yearsExperience = null;
  account.certifications = [];
  account.portfolio = null;
  account.personalBio = null;
  account.invitationStatus = null;
  account.invitationToken = null;
  account.invitedAt = null;
  account.acceptedAt = null;
  account.approvedBy = null;
  account.rejectionReason = null;

  return account;
}
