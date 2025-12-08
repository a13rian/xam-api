import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetStaffByUserIdQuery } from './get-staff.query';
import {
  PARTNER_STAFF_REPOSITORY,
  IPartnerStaffRepository,
} from '../../../../domain/partner/repositories/partner-staff.repository.interface';
import { StaffResponseDto } from '../list-staff/list-staff.handler';

@QueryHandler(GetStaffByUserIdQuery)
export class GetStaffByUserIdHandler implements IQueryHandler<GetStaffByUserIdQuery> {
  constructor(
    @Inject(PARTNER_STAFF_REPOSITORY)
    private readonly staffRepository: IPartnerStaffRepository,
  ) {}

  async execute(
    query: GetStaffByUserIdQuery,
  ): Promise<{ items: StaffResponseDto[] }> {
    const staffList = await this.staffRepository.findByUserId(query.userId);

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
