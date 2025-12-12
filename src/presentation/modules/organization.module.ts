import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  OrganizationController,
  AdminOrganizationController,
} from '../http/controllers/organization.controller';
import { OrganizationRepository } from '../../infrastructure/persistence/typeorm/repositories/organization.repository';
import { OrganizationMapper } from '../../infrastructure/persistence/typeorm/mappers/organization.mapper';
import { ORGANIZATION_REPOSITORY } from '../../core/domain/organization/repositories/organization.repository.interface';
import { OrganizationOrmEntity } from '../../infrastructure/persistence/typeorm/entities/organization.orm-entity';
import { OrganizationCommandHandlers } from '../../core/application/organization/commands';
import { OrganizationQueryHandlers } from '../../core/application/organization/queries';
import { AccountModule } from './account.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([OrganizationOrmEntity]),
    forwardRef(() => AccountModule),
  ],
  controllers: [OrganizationController, AdminOrganizationController],
  providers: [
    OrganizationMapper,
    {
      provide: ORGANIZATION_REPOSITORY,
      useClass: OrganizationRepository,
    },
    ...OrganizationCommandHandlers,
    ...OrganizationQueryHandlers,
  ],
  exports: [ORGANIZATION_REPOSITORY],
})
export class OrganizationModule {}
