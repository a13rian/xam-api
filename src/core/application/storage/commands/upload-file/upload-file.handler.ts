import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { UploadFileCommand } from './upload-file.command';
import type { IStorageService } from '@core/domain/storage/services/storage.service.interface';
import { StorageConfigService } from '@infrastructure/config/storage.config';
import { FileKey } from '@core/domain/storage/value-objects/file-key.vo';
import {
  FileType,
  AllowedFileCategory,
} from '@core/domain/storage/value-objects/file-type.vo';
import { STORAGE_SERVICE } from '@shared/constants/injection-tokens';

export interface UploadFileResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
}

@CommandHandler(UploadFileCommand)
export class UploadFileHandler implements ICommandHandler<UploadFileCommand> {
  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
    private readonly config: StorageConfigService,
  ) {}

  async execute(command: UploadFileCommand): Promise<UploadFileResult> {
    const { file, ownerId, ownerType, purpose } = command;

    // Validate file size
    if (file.size > this.config.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed (${this.config.maxFileSize / 1024 / 1024}MB)`,
      );
    }

    // Validate file type based on purpose
    const category = this.getCategoryForPurpose(purpose);
    if (
      category !== AllowedFileCategory.ANY &&
      !FileType.isAllowed(file.mimetype, category)
    ) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed for ${purpose}. Allowed types: ${FileType.getAllowedTypes(category).join(', ')}`,
      );
    }

    // Determine bucket
    const bucket = this.getBucketForPurpose(purpose);

    // Generate unique key
    const fileKey = FileKey.create(
      `${ownerType}/${purpose}`,
      ownerId,
      file.originalname,
    );

    const result = await this.storageService.uploadFile({
      bucketName: bucket,
      key: fileKey.value,
      buffer: file.buffer,
      contentType: file.mimetype,
      isPublic: true,
      metadata: {
        originalName: file.originalname,
        ownerId,
        ownerType,
        purpose,
      },
    });

    return {
      url: result.url,
      key: result.key,
      bucket: result.bucket,
      size: result.size,
    };
  }

  private getCategoryForPurpose(purpose: string): AllowedFileCategory {
    switch (purpose) {
      case 'avatar':
      case 'gallery':
      case 'cover':
        return AllowedFileCategory.IMAGE;
      case 'document':
        return AllowedFileCategory.DOCUMENT;
      default:
        return AllowedFileCategory.ANY;
    }
  }

  private getBucketForPurpose(purpose: string): string {
    switch (purpose) {
      case 'avatar':
        return this.config.buckets.avatars;
      case 'gallery':
      case 'cover':
        return this.config.buckets.gallery;
      default:
        return this.config.buckets.gallery;
    }
  }
}
