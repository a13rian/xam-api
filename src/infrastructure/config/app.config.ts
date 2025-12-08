import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IAppConfig } from '@core/application/ports/config/app.config.port';

@Injectable()
export class AppConfigService implements IAppConfig {
  constructor(private readonly configService: ConfigService) {}

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') ?? 'development';
  }

  get port(): number {
    return this.configService.get<number>('PORT') ?? 3000;
  }

  get appName(): string {
    return this.configService.get<string>('APP_NAME') ?? 'XAM API';
  }

  get apiPrefix(): string {
    return this.configService.get<string>('API_PREFIX') ?? 'api';
  }

  get apiVersion(): string {
    return this.configService.get<string>('API_VERSION') ?? 'v1';
  }

  get corsOrigins(): string[] {
    const origins = this.configService.get<string>('CORS_ORIGINS');
    if (origins) {
      return origins.split(',').map((origin) => origin.trim());
    }
    return ['http://localhost:3000'];
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development' || this.nodeEnv === 'local';
  }
}
