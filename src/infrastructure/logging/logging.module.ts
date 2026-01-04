import {
  Global,
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PinoLoggerService } from './pino-logger.service.js';
import { RequestContextStorage } from './request-context.storage.js';
import { RequestContextMiddleware } from './request-context.middleware.js';
import { LOGGER_SERVICE } from '@core/application/ports/logging/logger.port.js';

@Global()
@Module({
  providers: [
    RequestContextStorage,
    PinoLoggerService,
    {
      provide: LOGGER_SERVICE,
      useClass: PinoLoggerService,
    },
  ],
  exports: [LOGGER_SERVICE, RequestContextStorage],
})
export class LoggingModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes({ path: '{*path}', method: RequestMethod.ALL });
  }
}
