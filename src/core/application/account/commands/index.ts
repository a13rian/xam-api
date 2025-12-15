export * from './register-account';
export * from './approve-account';
export * from './update-account-profile';
export * from './add-gallery-image';
export * from './update-gallery-image';
export * from './remove-gallery-image';
export * from './reorder-gallery-images';

import { RegisterAccountHandler } from './register-account/register-account.handler';
import { ApproveAccountHandler } from './approve-account/approve-account.handler';
import { UpdateAccountProfileHandler } from './update-account-profile/update-account-profile.handler';
import { AddGalleryImageHandler } from './add-gallery-image/add-gallery-image.handler';
import { UpdateGalleryImageHandler } from './update-gallery-image/update-gallery-image.handler';
import { RemoveGalleryImageHandler } from './remove-gallery-image/remove-gallery-image.handler';
import { ReorderGalleryImagesHandler } from './reorder-gallery-images/reorder-gallery-images.handler';

export const AccountCommandHandlers = [
  RegisterAccountHandler,
  ApproveAccountHandler,
  UpdateAccountProfileHandler,
  AddGalleryImageHandler,
  UpdateGalleryImageHandler,
  RemoveGalleryImageHandler,
  ReorderGalleryImagesHandler,
];
