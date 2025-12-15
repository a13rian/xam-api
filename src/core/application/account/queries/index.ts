export * from './get-my-account';
export * from './search-accounts-by-location';
export * from './get-account-gallery';

import { GetMyAccountHandler } from './get-my-account/get-my-account.handler';
import { SearchAccountsByLocationHandler } from './search-accounts-by-location/search-accounts-by-location.handler';
import { GetAccountGalleryHandler } from './get-account-gallery/get-account-gallery.handler';

export const AccountQueryHandlers = [
  GetMyAccountHandler,
  SearchAccountsByLocationHandler,
  GetAccountGalleryHandler,
];
