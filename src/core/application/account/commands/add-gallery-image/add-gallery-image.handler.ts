import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { AddGalleryImageCommand } from './add-gallery-image.command';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';
import {
  IAccountGalleryRepository,
  ACCOUNT_GALLERY_REPOSITORY,
} from '../../../../domain/account/repositories/account-gallery.repository.interface';
import { AccountGallery } from '../../../../domain/account/entities/account-gallery.entity';

@CommandHandler(AddGalleryImageCommand)
export class AddGalleryImageHandler implements ICommandHandler<AddGalleryImageCommand> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Inject(ACCOUNT_GALLERY_REPOSITORY)
    private readonly galleryRepository: IAccountGalleryRepository,
  ) {}

  async execute(command: AddGalleryImageCommand): Promise<AccountGallery> {
    const account = await this.accountRepository.findById(command.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const gallery = AccountGallery.create({
      accountId: command.accountId,
      imageUrl: command.imageUrl,
      storageKey: command.storageKey,
      caption: command.caption,
      sortOrder: command.sortOrder,
    });

    await this.galleryRepository.save(gallery);
    return gallery;
  }
}
