import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ScheduleController,
  PartnerScheduleController,
} from '../http/controllers/schedule.controller';
import { TimeSlotOrmEntity } from '../../infrastructure/persistence/typeorm/entities/time-slot.orm-entity';
import { TimeSlotRepository } from '../../infrastructure/persistence/typeorm/repositories/time-slot.repository';
import { TimeSlotMapper } from '../../infrastructure/persistence/typeorm/mappers/time-slot.mapper';
import { TIME_SLOT_REPOSITORY } from '../../core/domain/schedule/repositories/time-slot.repository.interface';
import { ScheduleCommandHandlers } from '../../core/application/schedule/commands';
import { ScheduleQueryHandlers } from '../../core/application/schedule/queries';
import { LocationModule } from './location.module';
import { PartnerModule } from './partner.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([TimeSlotOrmEntity]),
    LocationModule,
    PartnerModule,
  ],
  controllers: [ScheduleController, PartnerScheduleController],
  providers: [
    TimeSlotMapper,
    {
      provide: TIME_SLOT_REPOSITORY,
      useClass: TimeSlotRepository,
    },
    ...ScheduleCommandHandlers,
    ...ScheduleQueryHandlers,
  ],
  exports: [TIME_SLOT_REPOSITORY],
})
export class ScheduleModule {}
