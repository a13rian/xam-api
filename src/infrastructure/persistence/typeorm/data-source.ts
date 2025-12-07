import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserOrmEntity } from './entities/user.orm-entity';
import { OrganizationOrmEntity } from './entities/organization.orm-entity';
import { RoleOrmEntity } from './entities/role.orm-entity';
import { PermissionOrmEntity } from './entities/permission.orm-entity';
import { RefreshTokenOrmEntity } from './entities/refresh-token.orm-entity';
import { PasswordResetTokenOrmEntity } from './entities/password-reset-token.orm-entity';
import { EmailVerificationTokenOrmEntity } from './entities/email-verification-token.orm-entity';

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
    OrganizationOrmEntity,
    RoleOrmEntity,
    PermissionOrmEntity,
    RefreshTokenOrmEntity,
    PasswordResetTokenOrmEntity,
    EmailVerificationTokenOrmEntity,
  ],
  migrations: ['src/infrastructure/persistence/typeorm/migrations/*.ts'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});

export default dataSource;
