export * from './approve-organization';

import { ApproveOrganizationHandler } from './approve-organization/approve-organization.handler';

export const OrganizationCommandHandlers = [ApproveOrganizationHandler];
