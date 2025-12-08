import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserOrmEntity } from './entities/user.orm-entity';
import { RoleOrmEntity } from './entities/role.orm-entity';
import { PermissionOrmEntity } from './entities/permission.orm-entity';
import { RefreshTokenOrmEntity } from './entities/refresh-token.orm-entity';
import { PasswordResetTokenOrmEntity } from './entities/password-reset-token.orm-entity';
import { EmailVerificationTokenOrmEntity } from './entities/email-verification-token.orm-entity';
import { WalletOrmEntity } from './entities/wallet.orm-entity';
import { WalletTransactionOrmEntity } from './entities/wallet-transaction.orm-entity';
import { PartnerOrmEntity } from './entities/partner.orm-entity';
import { PartnerDocumentOrmEntity } from './entities/partner-document.orm-entity';
import { ServiceCategoryOrmEntity } from './entities/service-category.orm-entity';
import { ServiceOrmEntity } from './entities/service.orm-entity';
import { PartnerLocationOrmEntity } from './entities/partner-location.orm-entity';
import { OperatingHoursOrmEntity } from './entities/operating-hours.orm-entity';
import { TimeSlotOrmEntity } from './entities/time-slot.orm-entity';
import {
  BookingOrmEntity,
  BookingServiceOrmEntity,
} from './entities/booking.orm-entity';
import { PartnerStaffOrmEntity } from './entities/partner-staff.orm-entity';
import { StaffServiceOrmEntity } from './entities/staff-service.orm-entity';

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
  ],
  migrations: ['src/infrastructure/persistence/typeorm/migrations/*.ts'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});

export default dataSource;
