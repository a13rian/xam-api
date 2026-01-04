import { Injectable, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import type {
  ILoggerService,
  LogMetadata,
} from '@core/application/ports/logging/logger.port.js';
import { RequestContextStorage } from './request-context.storage.js';

@Injectable({ scope: Scope.TRANSIENT })
export class PinoLoggerService implements ILoggerService {
  private context?: string;

  constructor(
    private readonly pinoLogger: PinoLogger,
    private readonly contextStorage: RequestContextStorage,
  ) {}

  child(context: string): ILoggerService {
    const childLogger = new PinoLoggerService(
      this.pinoLogger,
      this.contextStorage,
    );
    childLogger.context = context;
    childLogger.pinoLogger.setContext(context);
    return childLogger;
  }

  private enrichMetadata(metadata?: LogMetadata): LogMetadata {
    const requestContext = this.contextStorage.getContext();
    const enriched: LogMetadata = { ...metadata };

    if (requestContext) {
      Object.assign(enriched, requestContext.toLogObject());
    }

    if (this.context) {
      enriched.context = this.context;
    }

    return enriched;
  }

  log(message: string, metadata?: LogMetadata): void {
    this.pinoLogger.info(this.enrichMetadata(metadata), message);
  }

  error(
    message: string,
    traceOrMetadata?: string | LogMetadata,
    metadata?: LogMetadata,
  ): void {
    if (typeof traceOrMetadata === 'string') {
      this.pinoLogger.error(
        this.enrichMetadata({ ...metadata, stack: traceOrMetadata }),
        message,
      );
    } else {
      this.pinoLogger.error(this.enrichMetadata(traceOrMetadata), message);
    }
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.pinoLogger.warn(this.enrichMetadata(metadata), message);
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.pinoLogger.debug(this.enrichMetadata(metadata), message);
  }

  verbose(message: string, metadata?: LogMetadata): void {
    this.pinoLogger.trace(this.enrichMetadata(metadata), message);
  }
}
