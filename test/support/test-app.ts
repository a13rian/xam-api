import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { DatabaseHelper } from './database/database.helper';

export interface TestContext {
  app: INestApplication;
  module: TestingModule;
  db: DatabaseHelper;
  server: ReturnType<INestApplication['getHttpServer']>;
}

export async function createTestApp(): Promise<TestContext> {
  // Environment variables should already be set by test-env.ts
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Apply same global prefix as main.ts
  app.setGlobalPrefix('api');

  // Apply validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();

  return {
    app,
    module: moduleFixture,
    db: DatabaseHelper.fromApp(app),
    server: app.getHttpServer(),
  };
}

export async function closeTestApp(ctx: TestContext): Promise<void> {
  await ctx.app.close();
}
