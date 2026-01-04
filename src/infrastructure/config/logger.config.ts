import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  ILoggerConfig,
  LogLevel,
} from '@core/application/ports/config/logger.config.port';

const DEFAULT_REDACT_PATHS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'secret',
  'apiKey',
  'api_key',
  'creditCard',
  'credit_card',
  'cardNumber',
  'card_number',
  'cvv',
  'ssn',
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.token',
  'req.body.refreshToken',
];

@Injectable()
export class LoggerConfigService implements ILoggerConfig {
  constructor(private readonly configService: ConfigService) {}

  get level(): LogLevel {
    return this.configService.get<LogLevel>('LOG_LEVEL') ?? 'info';
  }

  get prettyPrint(): boolean {
    const value = this.configService.get<string>('LOG_PRETTY');
    return value === 'true';
  }

  get redactPaths(): string[] {
    const customPaths = this.configService.get<string>('LOG_REDACT_PATHS');
    if (customPaths) {
      return [...DEFAULT_REDACT_PATHS, ...customPaths.split(',')];
    }
    return DEFAULT_REDACT_PATHS;
  }

  get correlationIdHeader(): string {
    return (
      this.configService.get<string>('CORRELATION_ID_HEADER') ??
      'X-Correlation-ID'
    );
  }
}
