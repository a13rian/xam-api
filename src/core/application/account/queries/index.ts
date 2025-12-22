export * from './get-my-account';
export * from './list-accounts';
export * from './list-pending-accounts';
export * from './search-accounts-by-location';
export * from './get-account-gallery';
export * from './get-account';

import { GetMyAccountHandler } from './get-my-account/get-my-account.handler';
import { ListAccountsHandler } from './list-accounts/list-accounts.handler';
import { ListPendingAccountsHandler } from './list-pending-accounts/list-pending-accounts.handler';
import { SearchAccountsByLocationHandler } from './search-accounts-by-location/search-accounts-by-location.handler';
import { GetAccountGalleryHandler } from './get-account-gallery/get-account-gallery.handler';
import { GetAccountHandler } from './get-account/get-account.handler';

export const AccountQueryHandlers = [
  GetMyAccountHandler,
  ListAccountsHandler,
  ListPendingAccountsHandler,
  SearchAccountsByLocationHandler,
  GetAccountGalleryHandler,
  GetAccountHandler,
];
