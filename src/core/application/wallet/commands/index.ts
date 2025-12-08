export * from './create-wallet';
export * from './deposit';
export * from './withdraw';

import { CreateWalletHandler } from './create-wallet';
import { DepositHandler } from './deposit';
import { WithdrawHandler } from './withdraw';

export const WalletCommandHandlers = [
  CreateWalletHandler,
  DepositHandler,
  WithdrawHandler,
];
