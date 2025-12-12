import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IThrottleConfig } from '@core/application/ports/config/throttle.config.port';

@Injectable()
export class ThrottleConfigService implements IThrottleConfig {
  constructor(private readonly configService: ConfigService) {}

  get ttl(): number {
    return this.configService.get<number>('THROTTLE_TTL') ?? 60;
  }

  get limit(): number {
    return this.configService.get<number>('THROTTLE_LIMIT') ?? 100;
  }
}
