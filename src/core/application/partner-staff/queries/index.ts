export * from './list-staff/list-staff.query';
export * from './list-staff/list-staff.handler';
export * from './get-staff/get-staff.query';
export * from './get-staff/get-staff.handler';

import { ListStaffHandler } from './list-staff/list-staff.handler';
import { GetStaffByUserIdHandler } from './get-staff/get-staff.handler';

export const PartnerStaffQueryHandlers = [
  ListStaffHandler,
  GetStaffByUserIdHandler,
];
