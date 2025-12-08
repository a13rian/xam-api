import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  ILoggerConfig,
  LogLevel,
} from '@core/application/ports/config/logger.config.port';

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
}
