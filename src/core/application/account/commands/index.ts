export * from './register-account';
export * from './approve-account';
export * from './reject-account';
export * from './update-account-profile';
export * from './add-gallery-image';
export * from './update-gallery-image';
export * from './remove-gallery-image';
export * from './reorder-gallery-images';
export * from './suspend-account';
export * from './activate-account';
export * from './admin-update-account';
export * from './delete-account';

import { RegisterAccountHandler } from './register-account/register-account.handler';
import { ApproveAccountHandler } from './approve-account/approve-account.handler';
import { RejectAccountHandler } from './reject-account/reject-account.handler';
import { UpdateAccountProfileHandler } from './update-account-profile/update-account-profile.handler';
import { AddGalleryImageHandler } from './add-gallery-image/add-gallery-image.handler';
import { UpdateGalleryImageHandler } from './update-gallery-image/update-gallery-image.handler';
import { RemoveGalleryImageHandler } from './remove-gallery-image/remove-gallery-image.handler';
import { ReorderGalleryImagesHandler } from './reorder-gallery-images/reorder-gallery-images.handler';
import { SuspendAccountHandler } from './suspend-account/suspend-account.handler';
import { ActivateAccountHandler } from './activate-account/activate-account.handler';
import { AdminUpdateAccountHandler } from './admin-update-account/admin-update-account.handler';
import { DeleteAccountHandler } from './delete-account/delete-account.handler';

export const AccountCommandHandlers = [
  RegisterAccountHandler,
  ApproveAccountHandler,
  RejectAccountHandler,
  UpdateAccountProfileHandler,
  AddGalleryImageHandler,
  UpdateGalleryImageHandler,
  RemoveGalleryImageHandler,
  ReorderGalleryImagesHandler,
  SuspendAccountHandler,
  ActivateAccountHandler,
  AdminUpdateAccountHandler,
  DeleteAccountHandler,
];
