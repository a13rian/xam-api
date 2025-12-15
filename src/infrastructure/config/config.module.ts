import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './app.config.js';
import { DatabaseConfigService } from './database.config.js';
import { JwtConfigService } from './jwt.config.js';
import { LoggerConfigService } from './logger.config.js';
import { SwaggerConfigService } from './swagger.config.js';
import { ThrottleConfigService } from './throttle.config.js';
import { StorageConfigService } from './storage.config.js';
import {
  APP_CONFIG,
  DATABASE_CONFIG,
  JWT_CONFIG,
  LOGGER_CONFIG,
  SWAGGER_CONFIG,
  THROTTLE_CONFIG,
  STORAGE_CONFIG,
} from '@shared/constants/injection-tokens.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    AppConfigService,
    DatabaseConfigService,
    JwtConfigService,
    LoggerConfigService,
    SwaggerConfigService,
    ThrottleConfigService,
    StorageConfigService,
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
    {
      provide: SWAGGER_CONFIG,
      useExisting: SwaggerConfigService,
    },
    {
      provide: THROTTLE_CONFIG,
      useExisting: ThrottleConfigService,
    },
    {
      provide: STORAGE_CONFIG,
      useExisting: StorageConfigService,
    },
  ],
  exports: [
    APP_CONFIG,
    DATABASE_CONFIG,
    JWT_CONFIG,
    LOGGER_CONFIG,
    SWAGGER_CONFIG,
    THROTTLE_CONFIG,
    STORAGE_CONFIG,
    AppConfigService,
    DatabaseConfigService,
    JwtConfigService,
    LoggerConfigService,
    SwaggerConfigService,
    ThrottleConfigService,
    StorageConfigService,
  ],
})
export class AppConfigModule {}
