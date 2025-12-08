import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerModule } from 'nestjs-pino';
import type { IAppConfig } from './core/application/ports/config/app.config.port';
import type { ILoggerConfig } from './core/application/ports/config/logger.config.port';
import { AppConfigModule, validateEnv } from './infrastructure/config';
import { APP_CONFIG, LOGGER_CONFIG } from './shared/constants/injection-tokens';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';
import { AuthModule } from './presentation/modules/auth.module';
import { BookingModule } from './presentation/modules/booking.module';
import { CategoryModule } from './presentation/modules/category.module';
import { LocationModule } from './presentation/modules/location.module';
import { PartnerStaffModule } from './presentation/modules/partner-staff.module';
import { PartnerModule } from './presentation/modules/partner.module';
import { RoleModule } from './presentation/modules/role.module';
import { ScheduleModule } from './presentation/modules/schedule.module';
import { ServiceModule } from './presentation/modules/service.module';
import { UserModule } from './presentation/modules/user.module';
import { WalletModule } from './presentation/modules/wallet.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
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
      }),
    }),
    CqrsModule.forRoot(),
    PersistenceModule,
    AuthModule,
    UserModule,
    RoleModule,
    WalletModule,
    PartnerModule,
    CategoryModule,
    ServiceModule,
    LocationModule,
    ScheduleModule,
    BookingModule,
    PartnerStaffModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
