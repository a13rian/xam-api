import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { StorageController } from '../http/controllers/storage.controller';
import { MinioStorageService } from '@infrastructure/storage/minio/minio.service';
import { StorageConfigService } from '@infrastructure/config/storage.config';
import { STORAGE_SERVICE } from '@shared/constants/injection-tokens';
import { StorageCommandHandlers } from '@core/application/storage/commands';
import { StorageQueryHandlers } from '@core/application/storage/queries';

@Module({
  imports: [CqrsModule],
  controllers: [StorageController],
  providers: [
    StorageConfigService,
    {
      provide: STORAGE_SERVICE,
      useClass: MinioStorageService,
    },
    ...StorageCommandHandlers,
    ...StorageQueryHandlers,
  ],
  exports: [STORAGE_SERVICE, StorageConfigService],
})
export class StorageModule {}
