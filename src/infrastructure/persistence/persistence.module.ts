import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule, DatabaseConfigService } from '../config';
import { UserOrmEntity } from './typeorm/entities/user.orm-entity';
import { RoleOrmEntity } from './typeorm/entities/role.orm-entity';
import { PermissionOrmEntity } from './typeorm/entities/permission.orm-entity';
import { RefreshTokenOrmEntity } from './typeorm/entities/refresh-token.orm-entity';
import { PasswordResetTokenOrmEntity } from './typeorm/entities/password-reset-token.orm-entity';
import { EmailVerificationTokenOrmEntity } from './typeorm/entities/email-verification-token.orm-entity';
import { WalletOrmEntity } from './typeorm/entities/wallet.orm-entity';
import { WalletTransactionOrmEntity } from './typeorm/entities/wallet-transaction.orm-entity';
import { UserProfileOrmEntity } from './typeorm/entities/user-profile.orm-entity';
import { ServiceCategoryOrmEntity } from './typeorm/entities/service-category.orm-entity';
import { ServiceOrmEntity } from './typeorm/entities/service.orm-entity';
import { OperatingHoursOrmEntity } from './typeorm/entities/operating-hours.orm-entity';
import { TimeSlotOrmEntity } from './typeorm/entities/time-slot.orm-entity';
import {
  BookingOrmEntity,
  BookingServiceOrmEntity,
} from './typeorm/entities/booking.orm-entity';
import { StaffServiceOrmEntity } from './typeorm/entities/staff-service.orm-entity';
import { AccountOrmEntity } from './typeorm/entities/account.orm-entity';
import { OrganizationOrmEntity } from './typeorm/entities/organization.orm-entity';
import { OrganizationLocationOrmEntity } from './typeorm/entities/organization-location.orm-entity';
import { ProvinceOrmEntity } from './typeorm/entities/province.orm-entity';
import { DistrictOrmEntity } from './typeorm/entities/district.orm-entity';
import { WardOrmEntity } from './typeorm/entities/ward.orm-entity';

const entities = [
  UserOrmEntity,
  UserProfileOrmEntity,
  RoleOrmEntity,
  PermissionOrmEntity,
  RefreshTokenOrmEntity,
  PasswordResetTokenOrmEntity,
  EmailVerificationTokenOrmEntity,
  WalletOrmEntity,
  WalletTransactionOrmEntity,
  ServiceCategoryOrmEntity,
  ServiceOrmEntity,
  OrganizationLocationOrmEntity,
  OperatingHoursOrmEntity,
  TimeSlotOrmEntity,
  BookingOrmEntity,
  BookingServiceOrmEntity,
  StaffServiceOrmEntity,
  AccountOrmEntity,
  OrganizationOrmEntity,
  ProvinceOrmEntity,
  DistrictOrmEntity,
  WardOrmEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [DatabaseConfigService],
      useFactory: (databaseConfig: DatabaseConfigService) => ({
        type: 'postgres',
        host: databaseConfig.host,
        port: databaseConfig.port,
        username: databaseConfig.username,
        password: databaseConfig.password,
        database: databaseConfig.name,
        entities,
        migrations: ['dist/infrastructure/persistence/typeorm/migrations/*.js'],
        migrationsRun: false,
        synchronize: databaseConfig.synchronize,
        logging: databaseConfig.logging,
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  exports: [TypeOrmModule],
})
export class PersistenceModule {}
