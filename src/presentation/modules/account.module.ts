import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountController,
  AdminAccountController,
} from '../http/controllers/account.controller';
import { AccountRepository } from '../../infrastructure/persistence/typeorm/repositories/account.repository';
import { AccountMapper } from '../../infrastructure/persistence/typeorm/mappers/account.mapper';
import { ACCOUNT_REPOSITORY } from '../../core/domain/account/repositories/account.repository.interface';
import { AccountOrmEntity } from '../../infrastructure/persistence/typeorm/entities/account.orm-entity';
import { AccountCommandHandlers } from '../../core/application/account/commands';
import { AccountQueryHandlers } from '../../core/application/account/queries';
import { UserModule } from './user.module';
import { OrganizationModule } from './organization.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([AccountOrmEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => OrganizationModule),
  ],
  controllers: [AccountController, AdminAccountController],
  providers: [
    AccountMapper,
    {
      provide: ACCOUNT_REPOSITORY,
      useClass: AccountRepository,
    },
    ...AccountCommandHandlers,
    ...AccountQueryHandlers,
  ],
  exports: [ACCOUNT_REPOSITORY],
})
export class AccountModule {}
