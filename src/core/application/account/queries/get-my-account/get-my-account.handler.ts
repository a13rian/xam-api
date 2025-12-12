import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetMyAccountQuery } from './get-my-account.query';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';
import {
  IOrganizationRepository,
  ORGANIZATION_REPOSITORY,
} from '../../../../domain/organization/repositories/organization.repository.interface';

export interface GetMyAccountResult {
  id: string;
  userId: string;
  type: string;
  role: string | null;
  displayName: string;
  specialization: string | null;
  yearsExperience: number | null;
  certifications: string[];
  portfolio: string | null;
  personalBio: string | null;
  status: string;
  isActive: boolean;
  createdAt: Date;
  organization?: {
    id: string;
    businessName: string;
    status: string;
    description: string | null;
    rating: number;
    reviewCount: number;
  };
}

@QueryHandler(GetMyAccountQuery)
export class GetMyAccountHandler implements IQueryHandler<GetMyAccountQuery> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(query: GetMyAccountQuery): Promise<GetMyAccountResult> {
    const account = await this.accountRepository.findByUserId(query.userId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    let organization;
    if (account.organizationId) {
      const org = await this.organizationRepository.findById(
        account.organizationId,
      );
      if (org) {
        organization = {
          id: org.id,
          businessName: org.businessName,
          status: org.statusValue,
          description: org.description,
          rating: org.rating,
          reviewCount: org.reviewCount,
        };
      }
    }

    return {
      id: account.id,
      userId: account.userId,
      type: account.typeValue,
      role: account.roleValue,
      displayName: account.displayName,
      specialization: account.specialization,
      yearsExperience: account.yearsExperience,
      certifications: account.certifications,
      portfolio: account.portfolio,
      personalBio: account.personalBio,
      status: account.statusValue,
      isActive: account.isActive,
      createdAt: account.createdAt,
      organization,
    };
  }
}
