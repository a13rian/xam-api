import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module.js';
import type { IAppConfig } from './core/application/ports/config/app.config.port.js';
import type { ISwaggerConfig } from './core/application/ports/config/swagger.config.port.js';
import {
  APP_CONFIG,
  SWAGGER_CONFIG,
} from './shared/constants/injection-tokens.js';
import { setupSwagger } from './infrastructure/swagger/swagger.setup.js';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);

  const appConfig = app.get<IAppConfig>(APP_CONFIG);
  const swaggerConfig = app.get<ISwaggerConfig>(SWAGGER_CONFIG);

  // Security middleware
  app.use(helmet());

  // Compression middleware
  app.use(compression());

  app.enableCors({
    origin: appConfig.corsOrigins,
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  app.setGlobalPrefix(appConfig.apiPrefix);

  // Swagger setup (conditionally enabled)
  setupSwagger(app, swaggerConfig, appConfig.apiPrefix);

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  await app.listen(appConfig.port);

  logger.log(`Application running on: http://localhost:${appConfig.port}`);
  logger.log(`Environment: ${appConfig.nodeEnv}`);
  logger.log(`SWAGGER_ENABLED: ${swaggerConfig.enabled}`);

  if (swaggerConfig.enabled) {
    logger.log(
      `Swagger documentation: http://localhost:${appConfig.port}/${appConfig.apiPrefix}/docs`,
    );
  }

  // Graceful shutdown handling
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  let isShuttingDown = false;

  const handleShutdown = (signal: NodeJS.Signals) => {
    // Prevent multiple shutdown attempts
    if (isShuttingDown) {
      logger.warn(`Shutdown already in progress, ignoring ${signal}`);
      return;
    }

    isShuttingDown = true;
    logger.log(`Received ${signal}, starting graceful shutdown...`);

    const shutdownTimeout = setTimeout(() => {
      logger.error('Graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, appConfig.shutdownTimeout);

    app
      .close()
      .then(() => {
        clearTimeout(shutdownTimeout);
        logger.log('Graceful shutdown completed');
        process.exit(0);
      })
      .catch((error: unknown) => {
        clearTimeout(shutdownTimeout);
        logger.error('Error during graceful shutdown', error);
        process.exit(1);
      });
  };

  for (const signal of signals) {
    process.on(signal, () => handleShutdown(signal));
  }
}

void bootstrap();
