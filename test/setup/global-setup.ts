import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserOrmEntity } from '../../src/infrastructure/persistence/typeorm/entities/user.orm-entity';
import { OrganizationOrmEntity } from '../../src/infrastructure/persistence/typeorm/entities/organization.orm-entity';
import { RoleOrmEntity } from '../../src/infrastructure/persistence/typeorm/entities/role.orm-entity';
import { PermissionOrmEntity } from '../../src/infrastructure/persistence/typeorm/entities/permission.orm-entity';
import { RefreshTokenOrmEntity } from '../../src/infrastructure/persistence/typeorm/entities/refresh-token.orm-entity';
import { PasswordResetTokenOrmEntity } from '../../src/infrastructure/persistence/typeorm/entities/password-reset-token.orm-entity';
import { EmailVerificationTokenOrmEntity } from '../../src/infrastructure/persistence/typeorm/entities/email-verification-token.orm-entity';
import { seedPermissions } from '../../src/infrastructure/persistence/seeds/permissions.seed';
import { seedRoles } from '../../src/infrastructure/persistence/seeds/roles.seed';

export default async function globalSetup(): Promise<void> {
  // Load test environment
  config({ path: '.env.test' });

  console.log('Setting up test database...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'xam_api_test',
    entities: [
      UserOrmEntity,
      OrganizationOrmEntity,
      RoleOrmEntity,
      PermissionOrmEntity,
      RefreshTokenOrmEntity,
      PasswordResetTokenOrmEntity,
      EmailVerificationTokenOrmEntity,
    ],
    synchronize: true,
    dropSchema: true, // Drop all tables before each test run
  });

  try {
    await dataSource.initialize();
    console.log('Test data source initialized');

    // Seed permissions and roles
    const permissions = await seedPermissions(dataSource);
    await seedRoles(dataSource, permissions);

    console.log('Test database setup complete');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}
