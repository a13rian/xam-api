import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetAdminAccountQuery } from './get-admin-account.query';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';

export interface GetAdminAccountResult {
  id: string;
  userId: string;
  organizationId: string | null;
  type: string;
  role: string | null;
  displayName: string;
  specialization: string | null;
  portfolio: string | null;
  personalBio: string | null;
  status: string;
  isActive: boolean;
  approvedAt: Date | null;
  approvedBy: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Media fields
  avatarUrl: string | null;
  coverImageUrl: string | null;
  videoIntroUrl: string | null;
  // Contact fields
  phone: string | null;
  businessEmail: string | null;
  website: string | null;
  // Professional fields
  tagline: string | null;
  languages: string[];
  // Trust & Verification
  isVerified: boolean;
  verifiedAt: Date | null;
  badges: string[];
  rating: number | null;
  totalReviews: number;
  completedBookings: number;
}

@QueryHandler(GetAdminAccountQuery)
export class GetAdminAccountHandler implements IQueryHandler<GetAdminAccountQuery> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(query: GetAdminAccountQuery): Promise<GetAdminAccountResult> {
    const account = await this.accountRepository.findById(query.accountId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return {
      id: account.id,
      userId: account.userId,
      organizationId: account.organizationId,
      type: account.typeValue,
      role: account.roleValue,
      displayName: account.displayName,
      specialization: account.specialization,
      portfolio: account.portfolio,
      personalBio: account.personalBio,
      status: account.statusValue,
      isActive: account.isActive,
      approvedAt: account.approvedAt,
      approvedBy: account.approvedBy,
      rejectionReason: account.rejectionReason,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      avatarUrl: account.avatarUrl,
      coverImageUrl: account.coverImageUrl,
      videoIntroUrl: account.videoIntroUrl,
      phone: account.phone,
      businessEmail: account.businessEmail,
      website: account.website,
      tagline: account.tagline,
      languages: account.languages,
      isVerified: account.isVerified,
      verifiedAt: account.verifiedAt,
      badges: account.badges,
      rating: account.rating,
      totalReviews: account.totalReviews,
      completedBookings: account.completedBookings,
    };
  }
}
