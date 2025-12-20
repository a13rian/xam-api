import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IDatabaseConfig } from '@core/application/ports/config/database.config.port';

@Injectable()
export class DatabaseConfigService implements IDatabaseConfig {
  constructor(private readonly configService: ConfigService) {}

  get url(): string {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }

  get synchronize(): boolean {
    return this.configService.get<string>('DATABASE_SYNCHRONIZE') === 'true';
  }

  get logging(): boolean {
    return this.configService.get<string>('DATABASE_LOGGING') === 'true';
  }

  get ssl(): boolean {
    return this.configService.get<string>('DATABASE_SSL') === 'true';
  }
}
