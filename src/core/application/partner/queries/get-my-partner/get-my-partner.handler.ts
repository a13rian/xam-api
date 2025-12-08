import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMyPartnerQuery } from './get-my-partner.query';
import {
  IPartnerRepository,
  PARTNER_REPOSITORY,
} from '../../../../domain/partner/repositories/partner.repository.interface';
import { GetPartnerResult } from '../get-partner/get-partner.handler';

@QueryHandler(GetMyPartnerQuery)
export class GetMyPartnerHandler implements IQueryHandler<GetMyPartnerQuery> {
  constructor(
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute(query: GetMyPartnerQuery): Promise<GetPartnerResult | null> {
    const partner = await this.partnerRepository.findByUserId(query.userId);
    if (!partner) {
      return null;
    }

    return {
      id: partner.id,
      userId: partner.userId,
      type: partner.typeValue,
      status: partner.statusValue,
      businessName: partner.businessName,
      description: partner.description,
      rating: partner.rating,
      reviewCount: partner.reviewCount,
      isHomeServiceEnabled: partner.isHomeServiceEnabled,
      homeServiceRadiusKm: partner.homeServiceRadiusKm,
      rejectionReason: partner.rejectionReason,
      approvedAt: partner.approvedAt,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    };
  }
}
