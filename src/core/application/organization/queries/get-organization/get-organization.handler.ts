import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetOrganizationQuery } from './get-organization.query';
import {
  IOrganizationRepository,
  ORGANIZATION_REPOSITORY,
} from '../../../../domain/organization/repositories/organization.repository.interface';

export interface GetOrganizationResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetOrganizationQuery)
export class GetOrganizationHandler implements IQueryHandler<GetOrganizationQuery> {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(query: GetOrganizationQuery): Promise<GetOrganizationResult> {
    const organization = await this.organizationRepository.findById(query.id);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.description,
      ownerId: organization.ownerId,
      isActive: organization.isActive,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }
}
