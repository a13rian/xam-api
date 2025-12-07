import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationController } from '../http/controllers/organization.controller';
import { OrganizationRepository } from '../../infrastructure/persistence/typeorm/repositories/organization.repository';
import { OrganizationMapper } from '../../infrastructure/persistence/typeorm/mappers/organization.mapper';
import { ORGANIZATION_REPOSITORY } from '../../core/domain/organization/repositories/organization.repository.interface';
import { OrganizationOrmEntity } from '../../infrastructure/persistence/typeorm/entities/organization.orm-entity';
import {
  CreateOrganizationHandler,
  UpdateOrganizationHandler,
  DeleteOrganizationHandler,
} from '../../core/application/organization/commands';
import {
  GetOrganizationHandler,
  ListOrganizationsHandler,
} from '../../core/application/organization/queries';
import { UserModule } from './user.module';

const CommandHandlers = [
  CreateOrganizationHandler,
  UpdateOrganizationHandler,
  DeleteOrganizationHandler,
];

const QueryHandlers = [GetOrganizationHandler, ListOrganizationsHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([OrganizationOrmEntity]),
    forwardRef(() => UserModule),
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationMapper,
    {
      provide: ORGANIZATION_REPOSITORY,
      useClass: OrganizationRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [ORGANIZATION_REPOSITORY],
})
export class OrganizationModule {}
