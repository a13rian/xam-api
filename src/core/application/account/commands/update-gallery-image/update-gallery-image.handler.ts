import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateGalleryImageCommand } from './update-gallery-image.command';
import {
  IAccountGalleryRepository,
  ACCOUNT_GALLERY_REPOSITORY,
} from '../../../../domain/account/repositories/account-gallery.repository.interface';
import { AccountGallery } from '../../../../domain/account/entities/account-gallery.entity';

@CommandHandler(UpdateGalleryImageCommand)
export class UpdateGalleryImageHandler implements ICommandHandler<UpdateGalleryImageCommand> {
  constructor(
    @Inject(ACCOUNT_GALLERY_REPOSITORY)
    private readonly galleryRepository: IAccountGalleryRepository,
  ) {}

  async execute(command: UpdateGalleryImageCommand): Promise<AccountGallery> {
    const gallery = await this.galleryRepository.findById(command.galleryId);
    if (!gallery) {
      throw new NotFoundException('Gallery image not found');
    }

    if (gallery.accountId !== command.accountId) {
      throw new ForbiddenException(
        'You can only update your own gallery images',
      );
    }

    if (command.imageUrl !== undefined) {
      gallery.updateImage(command.imageUrl);
    }

    if (command.caption !== undefined) {
      gallery.updateCaption(command.caption);
    }

    await this.galleryRepository.save(gallery);
    return gallery;
  }
}
