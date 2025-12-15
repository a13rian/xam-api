import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPresignedUrlQuery } from './get-presigned-url.query';
import type { IStorageService } from '@core/domain/storage/services/storage.service.interface';
import { STORAGE_SERVICE } from '@shared/constants/injection-tokens';

export interface GetPresignedUrlResult {
  url: string;
  expiresIn: number;
}

@QueryHandler(GetPresignedUrlQuery)
export class GetPresignedUrlHandler implements IQueryHandler<GetPresignedUrlQuery> {
  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async execute(query: GetPresignedUrlQuery): Promise<GetPresignedUrlResult> {
    const { bucket, key, operation, expiresIn } = query;

    const url = await this.storageService.getPresignedUrl({
      bucketName: bucket,
      key,
      operation,
      expiresIn,
    });

    return {
      url,
      expiresIn,
    };
  }
}
