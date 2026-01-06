import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from '../http/controllers/wallet.controller';
import { AdminWalletController } from '../http/controllers/admin-wallet.controller';
import { WalletRepository } from '../../infrastructure/persistence/typeorm/repositories/wallet.repository';
import { WalletTransactionRepository } from '../../infrastructure/persistence/typeorm/repositories/wallet-transaction.repository';
import { WalletMapper } from '../../infrastructure/persistence/typeorm/mappers/wallet.mapper';
import { WalletTransactionMapper } from '../../infrastructure/persistence/typeorm/mappers/wallet-transaction.mapper';
import { WALLET_REPOSITORY } from '../../core/domain/wallet/repositories/wallet.repository.interface';
import { WALLET_TRANSACTION_REPOSITORY } from '../../core/domain/wallet/repositories/wallet-transaction.repository.interface';
import { WalletOrmEntity } from '../../infrastructure/persistence/typeorm/entities/wallet.orm-entity';
import { WalletTransactionOrmEntity } from '../../infrastructure/persistence/typeorm/entities/wallet-transaction.orm-entity';
import { WalletCommandHandlers } from '../../core/application/wallet/commands';
import { WalletQueryHandlers } from '../../core/application/wallet/queries';
import { WalletEventHandlers } from '../../core/application/wallet/event-handlers';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([WalletOrmEntity, WalletTransactionOrmEntity]),
  ],
  controllers: [WalletController, AdminWalletController],
  providers: [
    WalletMapper,
    WalletTransactionMapper,
    {
      provide: WALLET_REPOSITORY,
      useClass: WalletRepository,
    },
    {
      provide: WALLET_TRANSACTION_REPOSITORY,
      useClass: WalletTransactionRepository,
    },
    ...WalletCommandHandlers,
    ...WalletQueryHandlers,
    ...WalletEventHandlers,
  ],
  exports: [WALLET_REPOSITORY, WALLET_TRANSACTION_REPOSITORY],
})
export class WalletModule {}
