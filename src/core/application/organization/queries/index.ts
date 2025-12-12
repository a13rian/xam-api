export * from './get-my-organization';

import { GetMyOrganizationHandler } from './get-my-organization/get-my-organization.handler';

export const OrganizationQueryHandlers = [GetMyOrganizationHandler];
