export * from './create-wallet';
export * from './deposit';
export * from './withdraw';
export * from './admin-adjust-balance';

import { CreateWalletHandler } from './create-wallet';
import { DepositHandler } from './deposit';
import { WithdrawHandler } from './withdraw';
import { AdminAdjustBalanceHandler } from './admin-adjust-balance';

export const WalletCommandHandlers = [
  CreateWalletHandler,
  DepositHandler,
  WithdrawHandler,
  AdminAdjustBalanceHandler,
];
