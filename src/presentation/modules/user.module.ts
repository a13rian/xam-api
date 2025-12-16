import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../http/controllers/user.controller';
import { UserRepository } from '../../infrastructure/persistence/typeorm/repositories/user.repository';
import { UserMapper } from '../../infrastructure/persistence/typeorm/mappers/user.mapper';
import { USER_REPOSITORY } from '../../core/domain/user/repositories/user.repository.interface';
import { UserOrmEntity } from '../../infrastructure/persistence/typeorm/entities/user.orm-entity';
import { RoleOrmEntity } from '../../infrastructure/persistence/typeorm/entities/role.orm-entity';
import {
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  UpdateUserAvatarHandler,
  RemoveUserAvatarHandler,
  UpdateNotificationSettingsHandler,
} from '../../core/application/user/commands';
import {
  GetUserHandler,
  ListUsersHandler,
  GetNotificationSettingsHandler,
} from '../../core/application/user/queries';
import { RoleModule } from './role.module';
import { StorageModule } from './storage.module';

const CommandHandlers = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  UpdateUserAvatarHandler,
  RemoveUserAvatarHandler,
  UpdateNotificationSettingsHandler,
];

const QueryHandlers = [
  GetUserHandler,
  ListUsersHandler,
  GetNotificationSettingsHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([UserOrmEntity, RoleOrmEntity]),
    forwardRef(() => RoleModule),
    StorageModule,
  ],
  controllers: [UserController],
  providers: [
    UserMapper,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
