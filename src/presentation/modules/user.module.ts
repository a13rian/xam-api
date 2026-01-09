import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../http/controllers/user.controller';
import { UserRepository } from '../../infrastructure/persistence/typeorm/repositories/user.repository';
import { UserMapper } from '../../infrastructure/persistence/typeorm/mappers/user.mapper';
import { USER_REPOSITORY } from '../../core/domain/user/repositories/user.repository.interface';
import {
  UserOrmEntity,
  RoleOrmEntity,
  AccountOrmEntity,
  BookingOrmEntity,
  WalletOrmEntity,
  RefreshTokenOrmEntity,
  EmailVerificationTokenOrmEntity,
  PasswordResetTokenOrmEntity,
} from '../../infrastructure/persistence/typeorm/entities';
import { BcryptPasswordHasher } from '../../infrastructure/auth/bcrypt.password-hasher';
import { PASSWORD_HASHER } from '../../core/domain/auth/services/password-hasher.interface';
import {
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  UpdateUserAvatarHandler,
  RemoveUserAvatarHandler,
  UpdateNotificationSettingsHandler,
  AdminResetPasswordHandler,
  BulkDeleteUsersHandler,
  BulkUpdateStatusHandler,
} from '../../core/application/user/commands';
import {
  GetUserHandler,
  ListUsersHandler,
  GetNotificationSettingsHandler,
  ExportUsersHandler,
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
  AdminResetPasswordHandler,
  BulkDeleteUsersHandler,
  BulkUpdateStatusHandler,
];

const QueryHandlers = [
  GetUserHandler,
  ListUsersHandler,
  GetNotificationSettingsHandler,
  ExportUsersHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      UserOrmEntity,
      RoleOrmEntity,
      AccountOrmEntity,
      BookingOrmEntity,
      WalletOrmEntity,
      RefreshTokenOrmEntity,
      EmailVerificationTokenOrmEntity,
      PasswordResetTokenOrmEntity,
    ]),
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
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
