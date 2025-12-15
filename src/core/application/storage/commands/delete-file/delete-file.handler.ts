import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { DeleteFileCommand } from './delete-file.command';
import type { IStorageService } from '@core/domain/storage/services/storage.service.interface';
import { STORAGE_SERVICE } from '@shared/constants/injection-tokens';

@CommandHandler(DeleteFileCommand)
export class DeleteFileHandler implements ICommandHandler<DeleteFileCommand> {
  private readonly logger = new Logger(DeleteFileHandler.name);

  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async execute(command: DeleteFileCommand): Promise<void> {
    const { bucket, key } = command;

    try {
      await this.storageService.deleteFile({
        bucketName: bucket,
        key,
      });
      this.logger.log(`Deleted file: ${bucket}/${key}`);
    } catch (error) {
      this.logger.warn(
        `Failed to delete file ${bucket}/${key}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Don't throw - file deletion failures shouldn't break the main operation
    }
  }
}
