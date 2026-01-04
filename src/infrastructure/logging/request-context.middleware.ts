import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RequestContextStorage } from './request-context.storage.js';
import { RequestContext } from '@core/domain/logging/request-context.js';
import type { ILoggerConfig } from '@core/application/ports/config/logger.config.port';
import { LOGGER_CONFIG } from '@shared/constants/injection-tokens.js';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(
    private readonly contextStorage: RequestContextStorage,
    @Inject(LOGGER_CONFIG)
    private readonly loggerConfig: ILoggerConfig,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = uuidv4();
    const correlationIdHeader =
      this.loggerConfig.correlationIdHeader.toLowerCase();
    const correlationId =
      (req.headers[correlationIdHeader] as string) || requestId;

    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Correlation-ID', correlationId);

    const context = RequestContext.create({
      requestId,
      correlationId,
      method: req.method,
      path: req.originalUrl,
      startTime: Date.now(),
    });

    this.contextStorage.run(context, () => {
      next();
    });
  }
}
