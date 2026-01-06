import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from '../http/controllers/auth.controller';
import { JwtStrategy } from '../../infrastructure/auth/strategies/jwt.strategy';
import { TokenService } from '../../infrastructure/auth/services/token.service';
import { TOKEN_SERVICE } from '../../core/domain/auth/services/token.service.interface';
import { RefreshTokenOrmEntity } from '../../infrastructure/persistence/typeorm/entities/refresh-token.orm-entity';
import { PasswordResetTokenOrmEntity } from '../../infrastructure/persistence/typeorm/entities/password-reset-token.orm-entity';
import { EmailVerificationTokenOrmEntity } from '../../infrastructure/persistence/typeorm/entities/email-verification-token.orm-entity';
import {
  RegisterHandler,
  LoginHandler,
  RefreshTokenHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
  ChangePasswordHandler,
  VerifyEmailHandler,
  LogoutHandler,
} from '../../core/application/auth/commands/index';
import { GetMeHandler } from '../../core/application/auth/queries/index';
import { UserModule } from './user.module';
import { RoleModule } from './role.module';
import { WalletModule } from './wallet.module';
import {
  AppConfigModule,
  JwtConfigService,
} from '../../infrastructure/config/index';

const CommandHandlers = [
  RegisterHandler,
  LoginHandler,
  RefreshTokenHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
  ChangePasswordHandler,
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
    WalletModule,
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
