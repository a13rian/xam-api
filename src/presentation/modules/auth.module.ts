import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
  VerifyEmailHandler,
  LogoutHandler,
} from '../../core/application/auth/commands';
import { GetMeHandler } from '../../core/application/auth/queries';
import { UserModule } from './user.module';
import { RoleModule } from './role.module';
import { OrganizationModule } from './organization.module';

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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '1h';
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: expiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
          },
        };
      },
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
