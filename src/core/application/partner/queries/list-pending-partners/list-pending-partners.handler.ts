import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListPendingPartnersQuery } from './list-pending-partners.query';
import {
  IPartnerRepository,
  PARTNER_REPOSITORY,
} from '../../../../domain/partner/repositories/partner.repository.interface';
import { PartnerStatusEnum } from '../../../../domain/partner/value-objects/partner-status.vo';

export interface PartnerListItemDto {
  id: string;
  userId: string;
  type: string;
  status: string;
  businessName: string;
  createdAt: Date;
}

export interface ListPendingPartnersResult {
  partners: PartnerListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(ListPendingPartnersQuery)
export class ListPendingPartnersHandler implements IQueryHandler<ListPendingPartnersQuery> {
  constructor(
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute(
    query: ListPendingPartnersQuery,
  ): Promise<ListPendingPartnersResult> {
    const [partners, total] = await Promise.all([
      this.partnerRepository.findByStatus(PartnerStatusEnum.PENDING, {
        page: query.page,
        limit: query.limit,
      }),
      this.partnerRepository.countByStatus(PartnerStatusEnum.PENDING),
    ]);

    return {
      partners: partners.map((p) => ({
        id: p.id,
        userId: p.userId,
        type: p.typeValue,
        status: p.statusValue,
        businessName: p.businessName,
        createdAt: p.createdAt,
      })),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
