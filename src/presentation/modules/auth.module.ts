import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from '../http/controllers/auth.controller.js';
import { JwtStrategy } from '../../infrastructure/auth/strategies/jwt.strategy.js';
import { TokenService } from '../../infrastructure/auth/services/token.service.js';
import { TOKEN_SERVICE } from '../../core/domain/auth/services/token.service.interface.js';
import { RefreshTokenOrmEntity } from '../../infrastructure/persistence/typeorm/entities/refresh-token.orm-entity.js';
import { PasswordResetTokenOrmEntity } from '../../infrastructure/persistence/typeorm/entities/password-reset-token.orm-entity.js';
import { EmailVerificationTokenOrmEntity } from '../../infrastructure/persistence/typeorm/entities/email-verification-token.orm-entity.js';
import {
  RegisterHandler,
  LoginHandler,
  RefreshTokenHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
  VerifyEmailHandler,
  LogoutHandler,
} from '../../core/application/auth/commands/index.js';
import { GetMeHandler } from '../../core/application/auth/queries/index.js';
import { UserModule } from './user.module.js';
import { RoleModule } from './role.module.js';
import { OrganizationModule } from './organization.module.js';
import {
  AppConfigModule,
  JwtConfigService,
} from '../../infrastructure/config/index.js';

const CommandHandlers = [
  RegisterHandler,
  LoginHandler,
  RefreshTokenHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
  VerifyEmailHandler,
  LogoutHandler,
];

const QueryHandlers = [GetMeHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [JwtConfigService],
      useFactory: (jwtConfig: JwtConfigService) => ({
        secret: jwtConfig.secret,
        signOptions: {
          expiresIn: jwtConfig.expiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
    TypeOrmModule.forFeature([
      RefreshTokenOrmEntity,
      PasswordResetTokenOrmEntity,
      EmailVerificationTokenOrmEntity,
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => RoleModule),
    forwardRef(() => OrganizationModule),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    {
      provide: TOKEN_SERVICE,
      useClass: TokenService,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [JwtModule, PassportModule, TOKEN_SERVICE],
})
export class AuthModule {}
