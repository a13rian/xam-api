import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import type { IAppConfig } from './core/application/ports/config/app.config.port';
import type { ILoggerConfig } from './core/application/ports/config/logger.config.port';
import type { IThrottleConfig } from './core/application/ports/config/throttle.config.port';
import { AppConfigModule, validateEnv } from './infrastructure/config';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';
import { AccountModule } from './presentation/modules/account.module';
import { AuthModule } from './presentation/modules/auth.module';
import { BookingModule } from './presentation/modules/booking.module';
import { CategoryModule } from './presentation/modules/category.module';
import { HealthModule } from './presentation/modules/health.module';
import { LocationModule } from './presentation/modules/location.module';
import { OrganizationModule } from './presentation/modules/organization.module';
import { RoleModule } from './presentation/modules/role.module';
import { ScheduleModule } from './presentation/modules/schedule.module';
import { ServiceModule } from './presentation/modules/service.module';
import { StorageModule } from './presentation/modules/storage.module';
import { UserModule } from './presentation/modules/user.module';
import { WalletModule } from './presentation/modules/wallet.module';
import {
  APP_CONFIG,
  LOGGER_CONFIG,
  THROTTLE_CONFIG,
} from './shared/constants/injection-tokens';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { PermissionGuard } from './shared/guards/permission.guard';
import { ValidationPipe } from './shared/pipes/validation.pipe';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'test'
          ? ['.env.test']
          : ['.env.local', '.env'],
      validate: validateEnv,
    }),
    AppConfigModule,
    LoggerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [APP_CONFIG, LOGGER_CONFIG],
      useFactory: (appConfig: IAppConfig, loggerConfig: ILoggerConfig) => ({
        pinoHttp: {
          level: loggerConfig.level,
          transport: appConfig.isProduction
            ? undefined
            : {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'SYS:standard',
                },
              },
          autoLogging: false,
          quietReqLogger: true,
        },
        // Use named parameter syntax for NestJS 11+ compatibility with path-to-regexp v8+
        forRoutes: [{ path: '{*path}', method: RequestMethod.ALL }],
        exclude: [],
      }),
    }),
    CqrsModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [THROTTLE_CONFIG],
      useFactory: (throttleConfig: IThrottleConfig) => ({
        throttlers: [
          {
            ttl: throttleConfig.ttl * 1000,
            limit: throttleConfig.limit,
          },
        ],
        skipIf: (context) => {
          const request = context.switchToHttp().getRequest<{ url?: string }>();
          // Skip throttling for swagger routes to avoid legacy route path warnings
          return !!(
            request.url?.includes('/docs') || request.url?.includes('/swagger')
          );
        },
      }),
    }),
    PersistenceModule,
    HealthModule,
    AuthModule,
    UserModule,
    RoleModule,
    WalletModule,
    CategoryModule,
    ServiceModule,
    LocationModule,
    ScheduleModule,
    BookingModule,
    AccountModule,
    OrganizationModule,
    StorageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpExceptionFilter,
    // },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
