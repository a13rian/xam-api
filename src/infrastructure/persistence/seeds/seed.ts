import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserOrmEntity } from '../typeorm/entities/user.orm-entity';
import { RoleOrmEntity } from '../typeorm/entities/role.orm-entity';
import { PermissionOrmEntity } from '../typeorm/entities/permission.orm-entity';
import { RefreshTokenOrmEntity } from '../typeorm/entities/refresh-token.orm-entity';
import { PasswordResetTokenOrmEntity } from '../typeorm/entities/password-reset-token.orm-entity';
import { EmailVerificationTokenOrmEntity } from '../typeorm/entities/email-verification-token.orm-entity';
import { seedPermissions } from './permissions.seed';
import { seedRoles } from './roles.seed';
import { seedUsers } from './users.seed';

config({ path: '.env.local' });
config({ path: '.env' });

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'xam_api',
  entities: [
    UserOrmEntity,
    RoleOrmEntity,
    PermissionOrmEntity,
    RefreshTokenOrmEntity,
    PasswordResetTokenOrmEntity,
    EmailVerificationTokenOrmEntity,
  ],
  synchronize: true,
});

async function runSeeds() {
  try {
    await dataSource.initialize();
    console.log('Data source initialized');

    const permissions = await seedPermissions(dataSource);
    const roles = await seedRoles(dataSource, permissions);
    await seedUsers(dataSource, roles);

    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

void runSeeds();
