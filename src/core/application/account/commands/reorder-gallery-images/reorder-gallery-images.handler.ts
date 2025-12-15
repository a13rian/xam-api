import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException } from '@nestjs/common';
import { ReorderGalleryImagesCommand } from './reorder-gallery-images.command';
import {
  IAccountGalleryRepository,
  ACCOUNT_GALLERY_REPOSITORY,
} from '../../../../domain/account/repositories/account-gallery.repository.interface';

@CommandHandler(ReorderGalleryImagesCommand)
export class ReorderGalleryImagesHandler implements ICommandHandler<ReorderGalleryImagesCommand> {
  constructor(
    @Inject(ACCOUNT_GALLERY_REPOSITORY)
    private readonly galleryRepository: IAccountGalleryRepository,
  ) {}

  async execute(command: ReorderGalleryImagesCommand): Promise<void> {
    // Verify all items belong to this account
    const existingGallery = await this.galleryRepository.findByAccountId(
      command.accountId,
    );
    const existingIds = new Set(existingGallery.map((g) => g.id));

    for (const item of command.items) {
      if (!existingIds.has(item.id)) {
        throw new ForbiddenException(
          `Gallery image ${item.id} does not belong to this account`,
        );
      }
    }

    await this.galleryRepository.updateSortOrders(command.items);
  }
}
