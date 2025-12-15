import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RemoveGalleryImageCommand } from './remove-gallery-image.command';
import {
  IAccountGalleryRepository,
  ACCOUNT_GALLERY_REPOSITORY,
} from '../../../../domain/account/repositories/account-gallery.repository.interface';

@CommandHandler(RemoveGalleryImageCommand)
export class RemoveGalleryImageHandler implements ICommandHandler<RemoveGalleryImageCommand> {
  constructor(
    @Inject(ACCOUNT_GALLERY_REPOSITORY)
    private readonly galleryRepository: IAccountGalleryRepository,
  ) {}

  async execute(command: RemoveGalleryImageCommand): Promise<void> {
    const gallery = await this.galleryRepository.findById(command.galleryId);
    if (!gallery) {
      throw new NotFoundException('Gallery image not found');
    }

    if (gallery.accountId !== command.accountId) {
      throw new ForbiddenException(
        'You can only remove your own gallery images',
      );
    }

    await this.galleryRepository.delete(command.galleryId);
  }
}
