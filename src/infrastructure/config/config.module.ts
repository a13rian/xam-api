import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './app.config.js';
import { DatabaseConfigService } from './database.config.js';
import { JwtConfigService } from './jwt.config.js';
import { LoggerConfigService } from './logger.config.js';
import {
  APP_CONFIG,
  DATABASE_CONFIG,
  JWT_CONFIG,
  LOGGER_CONFIG,
} from '@shared/constants/injection-tokens.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    AppConfigService,
    DatabaseConfigService,
    JwtConfigService,
    LoggerConfigService,
    {
      provide: APP_CONFIG,
      useExisting: AppConfigService,
    },
    {
      provide: DATABASE_CONFIG,
      useExisting: DatabaseConfigService,
    },
    {
      provide: JWT_CONFIG,
      useExisting: JwtConfigService,
    },
    {
      provide: LOGGER_CONFIG,
      useExisting: LoggerConfigService,
    },
  ],
  exports: [
    APP_CONFIG,
    DATABASE_CONFIG,
    JWT_CONFIG,
    LOGGER_CONFIG,
    AppConfigService,
    DatabaseConfigService,
    JwtConfigService,
    LoggerConfigService,
  ],
})
export class AppConfigModule {}
