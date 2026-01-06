export * from './get-wallet';
export * from './get-balance';
export * from './list-transactions';
export * from './list-all-wallets';

import { GetWalletHandler } from './get-wallet';
import { GetBalanceHandler } from './get-balance';
import { ListTransactionsHandler } from './list-transactions';
import { ListAllWalletsHandler } from './list-all-wallets';

export const WalletQueryHandlers = [
  GetWalletHandler,
  GetBalanceHandler,
  ListTransactionsHandler,
  ListAllWalletsHandler,
];
