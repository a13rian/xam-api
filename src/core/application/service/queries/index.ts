export * from './get-service/get-service.query';
export * from './get-service/get-service.handler';
export * from './list-services/list-services.query';
export * from './list-services/list-services.handler';
export * from './list-partner-services/list-partner-services.query';
export * from './list-partner-services/list-partner-services.handler';
export * from './list-staff-services/list-staff-services.query';
export * from './list-staff-services/list-staff-services.handler';

import { GetServiceHandler } from './get-service/get-service.handler';
import { ListServicesHandler } from './list-services/list-services.handler';
import { ListPartnerServicesHandler } from './list-partner-services/list-partner-services.handler';
import {
  ListStaffServicesHandler,
  ListServiceStaffHandler,
} from './list-staff-services/list-staff-services.handler';

export const ServiceQueryHandlers = [
  GetServiceHandler,
  ListServicesHandler,
  ListPartnerServicesHandler,
  ListStaffServicesHandler,
  ListServiceStaffHandler,
];
