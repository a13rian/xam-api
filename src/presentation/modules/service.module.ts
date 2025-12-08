import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ServiceController,
  PartnerServiceController,
} from '../http/controllers/service.controller';
import { ServiceOrmEntity } from '../../infrastructure/persistence/typeorm/entities/service.orm-entity';
import { StaffServiceOrmEntity } from '../../infrastructure/persistence/typeorm/entities/staff-service.orm-entity';
import { ServiceRepository } from '../../infrastructure/persistence/typeorm/repositories/service.repository';
import { StaffServiceRepository } from '../../infrastructure/persistence/typeorm/repositories/staff-service.repository';
import { ServiceMapper } from '../../infrastructure/persistence/typeorm/mappers/service.mapper';
import { StaffServiceMapper } from '../../infrastructure/persistence/typeorm/mappers/staff-service.mapper';
import { SERVICE_REPOSITORY } from '../../core/domain/service/repositories/service.repository.interface';
import { STAFF_SERVICE_REPOSITORY } from '../../core/domain/service/repositories/staff-service.repository.interface';
import { ServiceCommandHandlers } from '../../core/application/service/commands';
import { ServiceQueryHandlers } from '../../core/application/service/queries';
import { CategoryModule } from './category.module';
import { PartnerModule } from './partner.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([ServiceOrmEntity, StaffServiceOrmEntity]),
    CategoryModule,
    forwardRef(() => PartnerModule),
  ],
  controllers: [ServiceController, PartnerServiceController],
  providers: [
    ServiceMapper,
    StaffServiceMapper,
    {
      provide: SERVICE_REPOSITORY,
      useClass: ServiceRepository,
    },
    {
      provide: STAFF_SERVICE_REPOSITORY,
      useClass: StaffServiceRepository,
    },
    ...ServiceCommandHandlers,
    ...ServiceQueryHandlers,
  ],
  exports: [SERVICE_REPOSITORY, STAFF_SERVICE_REPOSITORY],
})
export class ServiceModule {}
