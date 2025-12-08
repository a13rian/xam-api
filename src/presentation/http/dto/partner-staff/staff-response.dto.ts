export class StaffResponseDto {
  id: string;
  partnerId: string;
  userId?: string;
  email: string;
  role: string;
  invitationStatus: string;
  invitedAt: Date;
  acceptedAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

export class InviteStaffResponseDto {
  id: string;
  email: string;
  role: string;
  invitationStatus: string;
  invitationToken: string;
}
