import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException } from '@nestjs/common';
import { ListStaffQuery } from './list-staff.query';
import {
  PARTNER_STAFF_REPOSITORY,
  IPartnerStaffRepository,
} from '../../../../domain/partner/repositories/partner-staff.repository.interface';

export interface StaffResponseDto {
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

@QueryHandler(ListStaffQuery)
export class ListStaffHandler implements IQueryHandler<ListStaffQuery> {
  constructor(
    @Inject(PARTNER_STAFF_REPOSITORY)
    private readonly staffRepository: IPartnerStaffRepository,
  ) {}

  async execute(query: ListStaffQuery): Promise<{ items: StaffResponseDto[] }> {
    // Verify requester is staff of this partner
    const requester = await this.staffRepository.findByPartnerIdAndUserId(
      query.partnerId,
      query.requestedBy,
    );
    if (!requester) {
      throw new ForbiddenException(
        'You are not a staff member of this partner',
      );
    }

    const staffList = await this.staffRepository.findByPartnerId(
      query.partnerId,
    );

    return {
      items: staffList.map((s) => ({
        id: s.id,
        partnerId: s.partnerId,
        userId: s.userId,
        email: s.email,
        role: s.role.value,
        invitationStatus: s.invitationStatus.value,
        invitedAt: s.invitedAt,
        acceptedAt: s.acceptedAt,
        isActive: s.isActive,
        createdAt: s.createdAt,
      })),
    };
  }
}
