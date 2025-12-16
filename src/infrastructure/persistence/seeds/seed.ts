import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { SnakeNamingStrategy } from '../typeorm/naming-strategies/snake-naming.strategy';

// Parse command line arguments
const args = process.argv.slice(2);
const forceRefresh = args.includes('--refresh') || args.includes('-r');
import { UserOrmEntity } from '../typeorm/entities/user.orm-entity';
import { RoleOrmEntity } from '../typeorm/entities/role.orm-entity';
import { PermissionOrmEntity } from '../typeorm/entities/permission.orm-entity';
import { RefreshTokenOrmEntity } from '../typeorm/entities/refresh-token.orm-entity';
import { PasswordResetTokenOrmEntity } from '../typeorm/entities/password-reset-token.orm-entity';
import { EmailVerificationTokenOrmEntity } from '../typeorm/entities/email-verification-token.orm-entity';
import { ProvinceOrmEntity } from '../typeorm/entities/province.orm-entity';
import { DistrictOrmEntity } from '../typeorm/entities/district.orm-entity';
import { WardOrmEntity } from '../typeorm/entities/ward.orm-entity';
import { OrganizationOrmEntity } from '../typeorm/entities/organization.orm-entity';
import { OrganizationLocationOrmEntity } from '../typeorm/entities/organization-location.orm-entity';
import { AccountOrmEntity } from '../typeorm/entities/account.orm-entity';
import { AccountGalleryOrmEntity } from '../typeorm/entities/account-gallery.orm-entity';
import { seedPermissions } from './permissions.seed';
import { seedRoles } from './roles.seed';
import { seedUsers } from './users.seed';
import { seedProvinces } from './provinces.seed';
import { seedDistricts } from './districts.seed';
import { seedWards } from './wards.seed';
import { seedNormalUsers, seedBulkUsers } from './seed-users.seed';
import { seedOrganizations } from './seed-organizations.seed';
import { seedAccountsWithLocations } from './seed-accounts.seed';

config({ path: '.env.local' });
config({ path: '.env' });

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'xam_api',
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    UserOrmEntity,
    RoleOrmEntity,
    PermissionOrmEntity,
    RefreshTokenOrmEntity,
    PasswordResetTokenOrmEntity,
    EmailVerificationTokenOrmEntity,
    ProvinceOrmEntity,
    DistrictOrmEntity,
    WardOrmEntity,
    OrganizationOrmEntity,
    OrganizationLocationOrmEntity,
    AccountOrmEntity,
    AccountGalleryOrmEntity,
  ],
  synchronize: false,
});

async function cleanupDatabase(ds: DataSource): Promise<void> {
  console.log('Cleaning existing data...');

  // Order matters: delete dependent tables first (respecting foreign keys)
  const tables = [
    'account_galleries',
    'accounts',
    'organization_locations',
    'organizations',
    'wallet_transactions',
    'wallets',
    'user_profiles',
    'refresh_tokens',
    'password_reset_tokens',
    'email_verification_tokens',
    'user_roles',
    'users',
    'wards',
    'districts',
    'provinces',
    'role_permissions',
    'roles',
    'permissions',
  ];

  for (const table of tables) {
    try {
      await ds.query(`TRUNCATE TABLE "${table}" CASCADE`);
      console.log(`  Truncated ${table}`);
    } catch {
      // Table might not exist, ignore
    }
  }

  console.log('Cleanup complete');
}

async function runSeeds() {
  try {
    await dataSource.initialize();
    console.log('Data source initialized');

    if (forceRefresh) {
      await cleanupDatabase(dataSource);
    }

    const permissions = await seedPermissions(dataSource);
    const roles = await seedRoles(dataSource, permissions);
    await seedUsers(dataSource, roles);

    // Geographic seeds
    const provinces = await seedProvinces(dataSource);
    const districts = await seedDistricts(dataSource, provinces);
    await seedWards(dataSource, districts);

    // Additional users and accounts with locations
    await seedNormalUsers(dataSource, roles);
    const bulkUsers = await seedBulkUsers(dataSource, roles, 1000);
    const { orgs } = await seedOrganizations(dataSource);
    await seedAccountsWithLocations(dataSource, bulkUsers, orgs);

    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

void runSeeds();
