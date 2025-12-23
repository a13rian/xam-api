export * from './create-account-service/create-account-service.command';
export * from './create-account-service/create-account-service.handler';
export * from './update-account-service/update-account-service.command';
export * from './update-account-service/update-account-service.handler';
export * from './toggle-account-service/toggle-account-service.command';
export * from './toggle-account-service/toggle-account-service.handler';
export * from './delete-account-service/delete-account-service.command';
export * from './delete-account-service/delete-account-service.handler';

import { CreateAccountServiceHandler } from './create-account-service/create-account-service.handler';
import { UpdateAccountServiceHandler } from './update-account-service/update-account-service.handler';
import { ToggleAccountServiceHandler } from './toggle-account-service/toggle-account-service.handler';
import { DeleteAccountServiceHandler } from './delete-account-service/delete-account-service.handler';

export const AccountServiceCommandHandlers = [
  CreateAccountServiceHandler,
  UpdateAccountServiceHandler,
  ToggleAccountServiceHandler,
  DeleteAccountServiceHandler,
];
