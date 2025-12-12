export * from './register-account';
export * from './approve-account';

import { RegisterAccountHandler } from './register-account/register-account.handler';
import { ApproveAccountHandler } from './approve-account/approve-account.handler';

export const AccountCommandHandlers = [
  RegisterAccountHandler,
  ApproveAccountHandler,
];
