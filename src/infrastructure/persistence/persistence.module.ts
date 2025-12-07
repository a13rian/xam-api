import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserOrmEntity } from './typeorm/entities/user.orm-entity';
import { OrganizationOrmEntity } from './typeorm/entities/organization.orm-entity';
import { RoleOrmEntity } from './typeorm/entities/role.orm-entity';
import { PermissionOrmEntity } from './typeorm/entities/permission.orm-entity';
import { RefreshTokenOrmEntity } from './typeorm/entities/refresh-token.orm-entity';
import { PasswordResetTokenOrmEntity } from './typeorm/entities/password-reset-token.orm-entity';
import { EmailVerificationTokenOrmEntity } from './typeorm/entities/email-verification-token.orm-entity';

const entities = [
  UserOrmEntity,
  OrganizationOrmEntity,
  RoleOrmEntity,
  PermissionOrmEntity,
  RefreshTokenOrmEntity,
  PasswordResetTokenOrmEntity,
  EmailVerificationTokenOrmEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'xam_api'),
        entities,
        migrations: ['dist/infrastructure/persistence/typeorm/migrations/*.js'],
        migrationsRun: configService.get<boolean>('DB_MIGRATIONS_RUN', false),
        synchronize: false,
        logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  exports: [TypeOrmModule],
})
export class PersistenceModule {}
