export * from './get-my-account';
export * from './search-accounts-by-location';

import { GetMyAccountHandler } from './get-my-account/get-my-account.handler';
import { SearchAccountsByLocationHandler } from './search-accounts-by-location/search-accounts-by-location.handler';

export const AccountQueryHandlers = [
  GetMyAccountHandler,
  SearchAccountsByLocationHandler,
];
