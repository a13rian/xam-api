import { config } from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from './naming-strategies/snake-naming.strategy';
import {
  BookingOrmEntity,
  BookingServiceOrmEntity,
} from './entities/booking.orm-entity';
import { EmailVerificationTokenOrmEntity } from './entities/email-verification-token.orm-entity';
import { OperatingHoursOrmEntity } from './entities/operating-hours.orm-entity';
import { PasswordResetTokenOrmEntity } from './entities/password-reset-token.orm-entity';
import { PermissionOrmEntity } from './entities/permission.orm-entity';
import { RefreshTokenOrmEntity } from './entities/refresh-token.orm-entity';
import { RoleOrmEntity } from './entities/role.orm-entity';
import { ServiceCategoryOrmEntity } from './entities/service-category.orm-entity';
import { ServiceOrmEntity } from './entities/service.orm-entity';
import { StaffServiceOrmEntity } from './entities/staff-service.orm-entity';
import { TimeSlotOrmEntity } from './entities/time-slot.orm-entity';
import { UserOrmEntity } from './entities/user.orm-entity';
import { WalletTransactionOrmEntity } from './entities/wallet-transaction.orm-entity';
import { WalletOrmEntity } from './entities/wallet.orm-entity';
import { AccountOrmEntity } from './entities/account.orm-entity';
import { AccountGalleryOrmEntity } from './entities/account-gallery.orm-entity';
import { AccountServiceOrmEntity } from './entities/account-service.orm-entity';
import { OrganizationOrmEntity } from './entities/organization.orm-entity';
import { OrganizationLocationOrmEntity } from './entities/organization-location.orm-entity';
import { ProvinceOrmEntity } from './entities/province.orm-entity';
import { DistrictOrmEntity } from './entities/district.orm-entity';
import { WardOrmEntity } from './entities/ward.orm-entity';

config({ path: '.env.local' });
config({ path: '.env' });

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    UserOrmEntity,
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
    AccountGalleryOrmEntity,
    AccountServiceOrmEntity,
    OrganizationOrmEntity,
    ProvinceOrmEntity,
    DistrictOrmEntity,
    WardOrmEntity,
  ],
  migrations: ['src/infrastructure/persistence/typeorm/migrations/*.ts'],
  synchronize: false,
  logging: process.env.DATABASE_LOGGING === 'true',
});

export default dataSource;

//await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
