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
} from '../../core/application/user/commands';
import {
  GetUserHandler,
  ListUsersHandler,
} from '../../core/application/user/queries';
import { RoleModule } from './role.module';

const CommandHandlers = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
];

const QueryHandlers = [GetUserHandler, ListUsersHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([UserOrmEntity, RoleOrmEntity]),
    forwardRef(() => RoleModule),
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
