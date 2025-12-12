import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ISwaggerConfig } from '@core/application/ports/config/swagger.config.port';

@Injectable()
export class SwaggerConfigService implements ISwaggerConfig {
  constructor(private readonly configService: ConfigService) {}

  get enabled(): boolean {
    return this.configService.get<boolean>('SWAGGER_ENABLED') ?? false;
  }
}
