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
import {
  IAccountServiceRepository,
  ACCOUNT_SERVICE_REPOSITORY,
} from '../../../../domain/account-service/repositories/account-service.repository.interface';

export interface MyAccountServiceResult {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  durationMinutes: number;
  categoryId: string;
  isActive: boolean;
  sortOrder: number;
}

export interface GetMyAccountResult {
  id: string;
  userId: string;
  type: string;
  role: string | null;
  displayName: string;
  specialization: string | null;
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
  services: MyAccountServiceResult[];
}

@QueryHandler(GetMyAccountQuery)
export class GetMyAccountHandler implements IQueryHandler<GetMyAccountQuery> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
    @Inject(ACCOUNT_SERVICE_REPOSITORY)
    private readonly accountServiceRepository: IAccountServiceRepository,
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

    // Get all services (including inactive for owner to manage)
    const serviceEntities = await this.accountServiceRepository.findByAccountId(
      account.id,
      false, // include inactive
    );
    const services: MyAccountServiceResult[] = serviceEntities.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description ?? null,
      price: s.price.amount,
      currency: s.price.currency,
      durationMinutes: s.durationMinutes,
      categoryId: s.categoryId,
      isActive: s.isActive,
      sortOrder: s.sortOrder,
    }));

    return {
      id: account.id,
      userId: account.userId,
      type: account.typeValue,
      role: account.roleValue,
      displayName: account.displayName,
      specialization: account.specialization,
      portfolio: account.portfolio,
      personalBio: account.personalBio,
      status: account.statusValue,
      isActive: account.isActive,
      createdAt: account.createdAt,
      organization,
      services,
    };
  }
}
