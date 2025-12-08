export * from './get-wallet';
export * from './get-balance';
export * from './list-transactions';

import { GetWalletHandler } from './get-wallet';
import { GetBalanceHandler } from './get-balance';
import { ListTransactionsHandler } from './list-transactions';

export const WalletQueryHandlers = [
  GetWalletHandler,
  GetBalanceHandler,
  ListTransactionsHandler,
];
