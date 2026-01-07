import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminStatsController } from '../http/controllers/admin.controller';
import { StatsQueryHandlers } from '../../core/application/stats/queries';
import { UserOrmEntity } from '../../infrastructure/persistence/typeorm/entities/user.orm-entity';
import { AccountOrmEntity } from '../../infrastructure/persistence/typeorm/entities/account.orm-entity';
import { BookingOrmEntity } from '../../infrastructure/persistence/typeorm/entities/booking.orm-entity';
import { WalletOrmEntity } from '../../infrastructure/persistence/typeorm/entities/wallet.orm-entity';
import { OrganizationOrmEntity } from '../../infrastructure/persistence/typeorm/entities/organization.orm-entity';
import { DashboardRepository } from '../../infrastructure/persistence/typeorm/repositories/dashboard.repository';
import { DASHBOARD_REPOSITORY } from '../../core/domain/stats/repositories/dashboard.repository.interface';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      UserOrmEntity,
      AccountOrmEntity,
      BookingOrmEntity,
      WalletOrmEntity,
      OrganizationOrmEntity,
    ]),
  ],
  controllers: [AdminStatsController],
  providers: [
    {
      provide: DASHBOARD_REPOSITORY,
      useClass: DashboardRepository,
    },
    ...StatsQueryHandlers,
  ],
})
export class AdminModule {}
