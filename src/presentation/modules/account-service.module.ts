import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountServiceController,
  PublicAccountServiceController,
} from '../http/controllers/account-service.controller';
import { AccountServiceOrmEntity } from '../../infrastructure/persistence/typeorm/entities/account-service.orm-entity';
import { AccountServiceRepository } from '../../infrastructure/persistence/typeorm/repositories/account-service.repository';
import { AccountServiceMapper } from '../../infrastructure/persistence/typeorm/mappers/account-service.mapper';
import { ACCOUNT_SERVICE_REPOSITORY } from '../../core/domain/account-service/repositories/account-service.repository.interface';
import { AccountServiceCommandHandlers } from '../../core/application/account-service/commands';
import { AccountServiceQueryHandlers } from '../../core/application/account-service/queries';
import { AccountModule } from './account.module';
import { CategoryModule } from './category.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([AccountServiceOrmEntity]),
    forwardRef(() => AccountModule),
    CategoryModule,
  ],
  controllers: [AccountServiceController, PublicAccountServiceController],
  providers: [
    AccountServiceMapper,
    {
      provide: ACCOUNT_SERVICE_REPOSITORY,
      useClass: AccountServiceRepository,
    },
    ...AccountServiceCommandHandlers,
    ...AccountServiceQueryHandlers,
  ],
  exports: [ACCOUNT_SERVICE_REPOSITORY],
})
export class AccountServiceModule {}
