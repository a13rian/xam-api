import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { IAppConfig } from './core/application/ports/config/app.config.port.js';
import { APP_CONFIG } from './shared/constants/injection-tokens.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);

  const appConfig = app.get<IAppConfig>(APP_CONFIG);

  app.enableCors({
    origin: appConfig.corsOrigins,
    credentials: true,
  });

  app.setGlobalPrefix(appConfig.apiPrefix);

  await app.listen(appConfig.port);

  logger.log(`Application running on: http://localhost:${appConfig.port}`);
  logger.log(`Environment: ${appConfig.nodeEnv}`);
}

void bootstrap();
