import { z } from 'zod';

const booleanString = z
  .string()
  .optional()
  .default('false')
  .transform((val) => val === 'true');

const envSchema = z.object({
  // App
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_NAME: z.string().optional().default('XAM API'),
  API_PREFIX: z.string().optional().default('api'),
  CORS_ORIGINS: z
    .string()
    .optional()
    .default('http://localhost:3000')
    .transform((val) => val.split(',').map((s) => s.trim())),

  // Database
  DB_HOST: z.string().optional().default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USERNAME: z.string().optional().default('postgres'),
  DB_PASSWORD: z.string().optional().default('password'),
  DB_NAME: z.string().optional().default('xam_api'),
  DB_SYNCHRONIZE: booleanString,
  DB_LOGGING: booleanString,
  DB_SSL: booleanString,

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().optional().default('15m'),
  JWT_REFRESH_SECRET: z.string().optional(),
  JWT_REFRESH_EXPIRES_IN: z.string().optional().default('7d'),

  // Rate Limiting
  THROTTLE_TTL: z.coerce.number().int().positive().default(60),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),

  // Swagger
  SWAGGER_ENABLED: booleanString,

  // Graceful Shutdown
  SHUTDOWN_TIMEOUT: z.coerce.number().int().positive().default(10000),

  // MinIO / S3 Storage
  MINIO_ENDPOINT: z.string().optional().default('localhost'),
  MINIO_PORT: z.coerce.number().int().positive().default(9000),
  MINIO_USE_SSL: booleanString,
  MINIO_ACCESS_KEY: z.string().optional().default('minioadmin'),
  MINIO_SECRET_KEY: z.string().optional().default('minioadmin'),
  MINIO_REGION: z.string().optional().default('us-east-1'),
  MINIO_PUBLIC_URL: z.string().optional(),
  STORAGE_MAX_FILE_SIZE: z.coerce.number().int().positive().default(10485760), // 10MB
  STORAGE_BUCKET_AVATARS: z.string().optional().default('avatars'),
  STORAGE_BUCKET_GALLERY: z.string().optional().default('gallery'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`Environment validation failed:\n${errors}`);
  }

  return result.data;
}
