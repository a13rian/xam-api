import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CustomerBookingController,
  PartnerBookingController,
} from '../http/controllers/booking.controller';
import {
  BookingOrmEntity,
  BookingServiceOrmEntity,
} from '../../infrastructure/persistence/typeorm/entities/booking.orm-entity';
import { BookingRepository } from '../../infrastructure/persistence/typeorm/repositories/booking.repository';
import { BookingMapper } from '../../infrastructure/persistence/typeorm/mappers/booking.mapper';
import { BOOKING_REPOSITORY } from '../../core/domain/booking/repositories/booking.repository.interface';
import { BookingCommandHandlers } from '../../core/application/booking/commands';
import { BookingQueryHandlers } from '../../core/application/booking/queries';
import { PartnerModule } from './partner.module';
import { LocationModule } from './location.module';
import { ServiceModule } from './service.module';
import { WalletModule } from './wallet.module';
import { ScheduleModule } from './schedule.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([BookingOrmEntity, BookingServiceOrmEntity]),
    PartnerModule,
    LocationModule,
    ServiceModule,
    WalletModule,
    ScheduleModule,
  ],
  controllers: [CustomerBookingController, PartnerBookingController],
  providers: [
    BookingMapper,
    {
      provide: BOOKING_REPOSITORY,
      useClass: BookingRepository,
    },
    ...BookingCommandHandlers,
    ...BookingQueryHandlers,
  ],
  exports: [BOOKING_REPOSITORY],
})
export class BookingModule {}
