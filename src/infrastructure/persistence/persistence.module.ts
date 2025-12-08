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
import { PartnerOrmEntity } from './typeorm/entities/partner.orm-entity';
import { PartnerDocumentOrmEntity } from './typeorm/entities/partner-document.orm-entity';
import { ServiceCategoryOrmEntity } from './typeorm/entities/service-category.orm-entity';
import { ServiceOrmEntity } from './typeorm/entities/service.orm-entity';
import { PartnerLocationOrmEntity } from './typeorm/entities/partner-location.orm-entity';
import { OperatingHoursOrmEntity } from './typeorm/entities/operating-hours.orm-entity';
import { TimeSlotOrmEntity } from './typeorm/entities/time-slot.orm-entity';
import {
  BookingOrmEntity,
  BookingServiceOrmEntity,
} from './typeorm/entities/booking.orm-entity';
import { PartnerStaffOrmEntity } from './typeorm/entities/partner-staff.orm-entity';
import { StaffServiceOrmEntity } from './typeorm/entities/staff-service.orm-entity';

const entities = [
  UserOrmEntity,
  RoleOrmEntity,
  PermissionOrmEntity,
  RefreshTokenOrmEntity,
  PasswordResetTokenOrmEntity,
  EmailVerificationTokenOrmEntity,
  WalletOrmEntity,
  WalletTransactionOrmEntity,
  PartnerOrmEntity,
  PartnerDocumentOrmEntity,
  ServiceCategoryOrmEntity,
  ServiceOrmEntity,
  PartnerLocationOrmEntity,
  OperatingHoursOrmEntity,
  TimeSlotOrmEntity,
  BookingOrmEntity,
  BookingServiceOrmEntity,
  PartnerStaffOrmEntity,
  StaffServiceOrmEntity,
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
