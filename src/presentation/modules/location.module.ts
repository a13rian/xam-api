import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  LocationController,
  PartnerLocationController,
} from '../http/controllers/location.controller';
import { PartnerLocationOrmEntity } from '../../infrastructure/persistence/typeorm/entities/partner-location.orm-entity';
import { OperatingHoursOrmEntity } from '../../infrastructure/persistence/typeorm/entities/operating-hours.orm-entity';
import { PartnerLocationRepository } from '../../infrastructure/persistence/typeorm/repositories/partner-location.repository';
import { OperatingHoursRepository } from '../../infrastructure/persistence/typeorm/repositories/operating-hours.repository';
import { PartnerLocationMapper } from '../../infrastructure/persistence/typeorm/mappers/partner-location.mapper';
import { OperatingHoursMapper } from '../../infrastructure/persistence/typeorm/mappers/operating-hours.mapper';
import { PARTNER_LOCATION_REPOSITORY } from '../../core/domain/location/repositories/partner-location.repository.interface';
import { OPERATING_HOURS_REPOSITORY } from '../../core/domain/location/repositories/operating-hours.repository.interface';
import { LocationCommandHandlers } from '../../core/application/location/commands';
import { LocationQueryHandlers } from '../../core/application/location/queries';
import { PartnerModule } from './partner.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      PartnerLocationOrmEntity,
      OperatingHoursOrmEntity,
    ]),
    PartnerModule,
  ],
  controllers: [LocationController, PartnerLocationController],
  providers: [
    PartnerLocationMapper,
    OperatingHoursMapper,
    {
      provide: PARTNER_LOCATION_REPOSITORY,
      useClass: PartnerLocationRepository,
    },
    {
      provide: OPERATING_HOURS_REPOSITORY,
      useClass: OperatingHoursRepository,
    },
    ...LocationCommandHandlers,
    ...LocationQueryHandlers,
  ],
  exports: [PARTNER_LOCATION_REPOSITORY, OPERATING_HOURS_REPOSITORY],
})
export class LocationModule {}
