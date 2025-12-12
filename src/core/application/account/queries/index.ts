export * from './get-my-account';

import { GetMyAccountHandler } from './get-my-account/get-my-account.handler';

export const AccountQueryHandlers = [GetMyAccountHandler];
