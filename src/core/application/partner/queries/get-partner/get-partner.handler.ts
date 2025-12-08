import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetPartnerQuery } from './get-partner.query';
import {
  IPartnerRepository,
  PARTNER_REPOSITORY,
} from '../../../../domain/partner/repositories/partner.repository.interface';

export interface GetPartnerResult {
  id: string;
  userId: string;
  type: string;
  status: string;
  businessName: string;
  description: string | null;
  rating: number;
  reviewCount: number;
  isHomeServiceEnabled: boolean;
  homeServiceRadiusKm: number | null;
  rejectionReason: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetPartnerQuery)
export class GetPartnerHandler implements IQueryHandler<GetPartnerQuery> {
  constructor(
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute(query: GetPartnerQuery): Promise<GetPartnerResult> {
    const partner = await this.partnerRepository.findById(query.id);
    if (!partner) {
      throw new NotFoundException('Partner not found');
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
