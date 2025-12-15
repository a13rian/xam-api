import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IStorageConfig } from '@core/application/ports/config/storage.config.port';

@Injectable()
export class StorageConfigService implements IStorageConfig {
  constructor(private readonly configService: ConfigService) {}

  get endpoint(): string {
    return this.configService.get<string>('MINIO_ENDPOINT') ?? 'localhost';
  }

  get port(): number {
    return this.configService.get<number>('MINIO_PORT') ?? 9000;
  }

  get useSSL(): boolean {
    return this.configService.get<string>('MINIO_USE_SSL') === 'true';
  }

  get accessKey(): string {
    return this.configService.get<string>('MINIO_ACCESS_KEY') ?? 'minioadmin';
  }

  get secretKey(): string {
    return this.configService.get<string>('MINIO_SECRET_KEY') ?? 'minioadmin';
  }

  get region(): string {
    return this.configService.get<string>('MINIO_REGION') ?? 'us-east-1';
  }

  get publicUrl(): string | null {
    return this.configService.get<string>('MINIO_PUBLIC_URL') ?? null;
  }

  get maxFileSize(): number {
    return this.configService.get<number>('STORAGE_MAX_FILE_SIZE') ?? 10485760; // 10MB default
  }

  get buckets() {
    return {
      avatars:
        this.configService.get<string>('STORAGE_BUCKET_AVATARS') ?? 'avatars',
      gallery:
        this.configService.get<string>('STORAGE_BUCKET_GALLERY') ?? 'gallery',
    };
  }
}
