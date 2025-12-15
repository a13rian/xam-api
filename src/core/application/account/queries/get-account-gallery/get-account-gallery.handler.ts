import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAccountGalleryQuery } from './get-account-gallery.query';
import {
  IAccountGalleryRepository,
  ACCOUNT_GALLERY_REPOSITORY,
} from '../../../../domain/account/repositories/account-gallery.repository.interface';
import { AccountGallery } from '../../../../domain/account/entities/account-gallery.entity';

@QueryHandler(GetAccountGalleryQuery)
export class GetAccountGalleryHandler implements IQueryHandler<GetAccountGalleryQuery> {
  constructor(
    @Inject(ACCOUNT_GALLERY_REPOSITORY)
    private readonly galleryRepository: IAccountGalleryRepository,
  ) {}

  async execute(query: GetAccountGalleryQuery): Promise<AccountGallery[]> {
    return this.galleryRepository.findByAccountId(query.accountId);
  }
}
