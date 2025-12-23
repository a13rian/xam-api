export * from './list-account-services/list-account-services.query';
export * from './list-account-services/list-account-services.handler';
export * from './get-account-service/get-account-service.query';
export * from './get-account-service/get-account-service.handler';

import { ListAccountServicesHandler } from './list-account-services/list-account-services.handler';
import { GetAccountServiceHandler } from './get-account-service/get-account-service.handler';

export const AccountServiceQueryHandlers = [
  ListAccountServicesHandler,
  GetAccountServiceHandler,
];
