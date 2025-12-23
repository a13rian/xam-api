import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountController,
  AdminAccountController,
} from '../http/controllers/account.controller';
import { AccountRepository } from '../../infrastructure/persistence/typeorm/repositories/account.repository';
import { AccountGalleryRepository } from '../../infrastructure/persistence/typeorm/repositories/account-gallery.repository';
import { AccountServiceRepository } from '../../infrastructure/persistence/typeorm/repositories/account-service.repository';
import { AccountMapper } from '../../infrastructure/persistence/typeorm/mappers/account.mapper';
import { AccountGalleryMapper } from '../../infrastructure/persistence/typeorm/mappers/account-gallery.mapper';
import { AccountServiceMapper } from '../../infrastructure/persistence/typeorm/mappers/account-service.mapper';
import { ACCOUNT_REPOSITORY } from '../../core/domain/account/repositories/account.repository.interface';
import { ACCOUNT_GALLERY_REPOSITORY } from '../../core/domain/account/repositories/account-gallery.repository.interface';
import { ACCOUNT_SERVICE_REPOSITORY } from '../../core/domain/account-service/repositories/account-service.repository.interface';
import { AccountOrmEntity } from '../../infrastructure/persistence/typeorm/entities/account.orm-entity';
import { AccountGalleryOrmEntity } from '../../infrastructure/persistence/typeorm/entities/account-gallery.orm-entity';
import { AccountServiceOrmEntity } from '../../infrastructure/persistence/typeorm/entities/account-service.orm-entity';
import { OrganizationLocationOrmEntity } from '../../infrastructure/persistence/typeorm/entities/organization-location.orm-entity';
import { AccountCommandHandlers } from '../../core/application/account/commands';
import { AccountQueryHandlers } from '../../core/application/account/queries';
import { UserModule } from './user.module';
import { OrganizationModule } from './organization.module';
import { StorageModule } from './storage.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      AccountOrmEntity,
      AccountGalleryOrmEntity,
      AccountServiceOrmEntity,
      OrganizationLocationOrmEntity,
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => OrganizationModule),
    StorageModule,
  ],
  controllers: [AccountController, AdminAccountController],
  providers: [
    AccountMapper,
    AccountGalleryMapper,
    AccountServiceMapper,
    {
      provide: ACCOUNT_REPOSITORY,
      useClass: AccountRepository,
    },
    {
      provide: ACCOUNT_GALLERY_REPOSITORY,
      useClass: AccountGalleryRepository,
    },
    {
      provide: ACCOUNT_SERVICE_REPOSITORY,
      useClass: AccountServiceRepository,
    },
    ...AccountCommandHandlers,
    ...AccountQueryHandlers,
  ],
  exports: [
    ACCOUNT_REPOSITORY,
    ACCOUNT_GALLERY_REPOSITORY,
    ACCOUNT_SERVICE_REPOSITORY,
  ],
})
export class AccountModule {}
