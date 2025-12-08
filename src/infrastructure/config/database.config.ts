import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IDatabaseConfig } from '@core/application/ports/config/database.config.port';

@Injectable()
export class DatabaseConfigService implements IDatabaseConfig {
  constructor(private readonly configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('DB_HOST') ?? 'localhost';
  }

  get port(): number {
    return this.configService.get<number>('DB_PORT') ?? 5432;
  }

  get username(): string {
    return this.configService.get<string>('DB_USERNAME') ?? 'postgres';
  }

  get password(): string {
    return this.configService.get<string>('DB_PASSWORD') ?? 'password';
  }

  get name(): string {
    return this.configService.get<string>('DB_NAME') ?? 'xam_api';
  }

  get synchronize(): boolean {
    return this.configService.get<string>('DB_SYNCHRONIZE') === 'true';
  }

  get logging(): boolean {
    return this.configService.get<string>('DB_LOGGING') === 'true';
  }

  get ssl(): boolean {
    return this.configService.get<string>('DB_SSL') === 'true';
  }
}
