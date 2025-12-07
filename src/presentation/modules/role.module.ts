import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleController } from '../http/controllers/role.controller';
import { RoleRepository } from '../../infrastructure/persistence/typeorm/repositories/role.repository';
import { PermissionRepository } from '../../infrastructure/persistence/typeorm/repositories/permission.repository';
import { RoleMapper } from '../../infrastructure/persistence/typeorm/mappers/role.mapper';
import { PermissionMapper } from '../../infrastructure/persistence/typeorm/mappers/permission.mapper';
import { ROLE_REPOSITORY } from '../../core/domain/role/repositories/role.repository.interface';
import { PERMISSION_REPOSITORY } from '../../core/domain/role/repositories/permission.repository.interface';
import { RoleOrmEntity } from '../../infrastructure/persistence/typeorm/entities/role.orm-entity';
import { PermissionOrmEntity } from '../../infrastructure/persistence/typeorm/entities/permission.orm-entity';
import {
  CreateRoleHandler,
  UpdateRoleHandler,
  DeleteRoleHandler,
} from '../../core/application/role/commands';
import {
  GetRoleHandler,
  ListRolesHandler,
  ListPermissionsHandler,
} from '../../core/application/role/queries';

const CommandHandlers = [
  CreateRoleHandler,
  UpdateRoleHandler,
  DeleteRoleHandler,
];

const QueryHandlers = [
  GetRoleHandler,
  ListRolesHandler,
  ListPermissionsHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([RoleOrmEntity, PermissionOrmEntity]),
  ],
  controllers: [RoleController],
  providers: [
    RoleMapper,
    PermissionMapper,
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleRepository,
    },
    {
      provide: PERMISSION_REPOSITORY,
      useClass: PermissionRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [ROLE_REPOSITORY, PERMISSION_REPOSITORY],
})
export class RoleModule {}
