export * from './invite-staff/invite-staff.command';
export * from './invite-staff/invite-staff.handler';
export * from './accept-invitation/accept-invitation.command';
export * from './accept-invitation/accept-invitation.handler';
export * from './remove-staff/remove-staff.command';
export * from './remove-staff/remove-staff.handler';
export * from './change-staff-role/change-staff-role.command';
export * from './change-staff-role/change-staff-role.handler';

import { InviteStaffHandler } from './invite-staff/invite-staff.handler';
import { AcceptInvitationHandler } from './accept-invitation/accept-invitation.handler';
import { RemoveStaffHandler } from './remove-staff/remove-staff.handler';
import { ChangeStaffRoleHandler } from './change-staff-role/change-staff-role.handler';

export const PartnerStaffCommandHandlers = [
  InviteStaffHandler,
  AcceptInvitationHandler,
  RemoveStaffHandler,
  ChangeStaffRoleHandler,
];
