import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { ISwaggerConfig } from '@core/application/ports/config/swagger.config.port';

export function setupSwagger(
  app: INestApplication,
  swaggerConfig: ISwaggerConfig,
  apiPrefix: string,
): void {
  if (!swaggerConfig.enabled) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle('XAM API')
    .setDescription('XAM API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
