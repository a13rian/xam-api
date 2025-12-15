import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client } from 'minio';
import type {
  IStorageService,
  UploadFileOptions,
  GetPresignedUrlOptions,
  DeleteFileOptions,
  FileExistsOptions,
  UploadResult,
} from '@core/domain/storage/services/storage.service.interface';
import { StorageConfigService } from '@infrastructure/config/storage.config';

@Injectable()
export class MinioStorageService implements IStorageService, OnModuleInit {
  private readonly logger = new Logger(MinioStorageService.name);
  private client: Client;

  constructor(private readonly config: StorageConfigService) {
    this.client = new Client({
      endPoint: config.endpoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      region: config.region,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      // Ensure default buckets exist on startup
      await this.ensureBucketExists(this.config.buckets.avatars, true);
      await this.ensureBucketExists(this.config.buckets.gallery, true);
      this.logger.log('MinIO storage initialized successfully');
    } catch (error) {
      this.logger.warn(
        'MinIO initialization skipped - service may not be available',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async ensureBucketExists(
    bucketName: string,
    isPublic = false,
  ): Promise<void> {
    const exists = await this.client.bucketExists(bucketName);
    if (!exists) {
      await this.client.makeBucket(bucketName, this.config.region);
      if (isPublic) {
        // Set public read policy
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        };
        await this.client.setBucketPolicy(bucketName, JSON.stringify(policy));
      }
      this.logger.log(`Created bucket: ${bucketName} (public: ${isPublic})`);
    }
  }

  async bucketExists(bucketName: string): Promise<boolean> {
    return this.client.bucketExists(bucketName);
  }

  async uploadFile(options: UploadFileOptions): Promise<UploadResult> {
    const { bucketName, key, buffer, contentType, metadata = {} } = options;

    const result = await this.client.putObject(
      bucketName,
      key,
      buffer,
      buffer.length,
      {
        'Content-Type': contentType,
        ...metadata,
      },
    );

    const url = this.getPublicUrl(bucketName, key);

    return {
      key,
      url,
      bucket: bucketName,
      etag: result.etag,
      size: buffer.length,
    };
  }

  async deleteFile(options: DeleteFileOptions): Promise<void> {
    await this.client.removeObject(options.bucketName, options.key);
  }

  async fileExists(options: FileExistsOptions): Promise<boolean> {
    try {
      await this.client.statObject(options.bucketName, options.key);
      return true;
    } catch {
      return false;
    }
  }

  async getPresignedUrl(options: GetPresignedUrlOptions): Promise<string> {
    const { bucketName, key, expiresIn = 3600, operation } = options;

    if (operation === 'get') {
      return this.client.presignedGetObject(bucketName, key, expiresIn);
    }
    return this.client.presignedPutObject(bucketName, key, expiresIn);
  }

  getPublicUrl(bucketName: string, key: string): string {
    if (this.config.publicUrl) {
      return `${this.config.publicUrl}/${bucketName}/${key}`;
    }

    const protocol = this.config.useSSL ? 'https' : 'http';
    return `${protocol}://${this.config.endpoint}:${this.config.port}/${bucketName}/${key}`;
  }
}
