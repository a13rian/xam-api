import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetMyOrganizationQuery } from './get-my-organization.query';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';
import {
  IOrganizationRepository,
  ORGANIZATION_REPOSITORY,
} from '../../../../domain/organization/repositories/organization.repository.interface';

export interface GetMyOrganizationResult {
  id: string;
  businessName: string;
  status: string;
  description: string | null;
  rating: number;
  reviewCount: number;
  isHomeServiceEnabled: boolean;
  homeServiceRadiusKm: number | null;
  taxId: string | null;
  businessLicense: string | null;
  companySize: string | null;
  website: string | null;
  socialMedia: Record<string, string>;
  establishedDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetMyOrganizationQuery)
export class GetMyOrganizationHandler implements IQueryHandler<GetMyOrganizationQuery> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(
    query: GetMyOrganizationQuery,
  ): Promise<GetMyOrganizationResult> {
    const account = await this.accountRepository.findByUserId(query.userId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (!account.organizationId) {
      throw new ForbiddenException('User does not belong to an organization');
    }

    const organization = await this.organizationRepository.findById(
      account.organizationId,
    );
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return {
      id: organization.id,
      businessName: organization.businessName,
      status: organization.statusValue,
      description: organization.description,
      rating: organization.rating,
      reviewCount: organization.reviewCount,
      isHomeServiceEnabled: organization.isHomeServiceEnabled,
      homeServiceRadiusKm: organization.homeServiceRadiusKm,
      taxId: organization.taxId,
      businessLicense: organization.businessLicense,
      companySize: organization.companySize,
      website: organization.website,
      socialMedia: organization.socialMedia,
      establishedDate: organization.establishedDate,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }
}
