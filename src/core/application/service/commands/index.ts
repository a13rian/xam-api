export * from './create-service/create-service.command';
export * from './create-service/create-service.handler';
export * from './update-service/update-service.command';
export * from './update-service/update-service.handler';
export * from './delete-service/delete-service.command';
export * from './delete-service/delete-service.handler';
export * from './toggle-service/toggle-service.command';
export * from './toggle-service/toggle-service.handler';
export * from './assign-staff/assign-staff.command';
export * from './assign-staff/assign-staff.handler';
export * from './unassign-staff/unassign-staff.command';
export * from './unassign-staff/unassign-staff.handler';

import { CreateServiceHandler } from './create-service/create-service.handler';
import { UpdateServiceHandler } from './update-service/update-service.handler';
import { DeleteServiceHandler } from './delete-service/delete-service.handler';
import { ToggleServiceHandler } from './toggle-service/toggle-service.handler';
import { AssignStaffToServiceHandler } from './assign-staff/assign-staff.handler';
import { UnassignStaffFromServiceHandler } from './unassign-staff/unassign-staff.handler';

export const ServiceCommandHandlers = [
  CreateServiceHandler,
  UpdateServiceHandler,
  DeleteServiceHandler,
  ToggleServiceHandler,
  AssignStaffToServiceHandler,
  UnassignStaffFromServiceHandler,
];
