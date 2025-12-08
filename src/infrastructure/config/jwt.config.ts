import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IJwtConfig } from '@core/application/ports/config/jwt.config.port';

@Injectable()
export class JwtConfigService implements IJwtConfig {
  constructor(private readonly configService: ConfigService) {}

  get secret(): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
  }

  get expiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN') ?? '15m';
  }

  get refreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET') ?? this.secret;
  }

  get refreshExpiresIn(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
  }
}
