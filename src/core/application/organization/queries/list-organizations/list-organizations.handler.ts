import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListOrganizationsQuery } from './list-organizations.query';
import {
  IOrganizationRepository,
  ORGANIZATION_REPOSITORY,
} from '../../../../domain/organization/repositories/organization.repository.interface';
import { Organization } from '../../../../domain/organization/entities/organization.entity';

export interface OrganizationListItem {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ListOrganizationsResult {
  items: OrganizationListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(ListOrganizationsQuery)
export class ListOrganizationsHandler implements IQueryHandler<ListOrganizationsQuery> {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(
    query: ListOrganizationsQuery,
  ): Promise<ListOrganizationsResult> {
    const { ownerId, page, limit } = query;

    let organizations: Organization[];
    let total: number;

    if (ownerId) {
      organizations = await this.organizationRepository.findByOwnerId(ownerId);
      total = organizations.length;
    } else {
      organizations = await this.organizationRepository.findAll({
        page,
        limit,
      });
      total = await this.organizationRepository.countAll();
    }

    const items: OrganizationListItem[] = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      ownerId: org.ownerId,
      isActive: org.isActive,
      createdAt: org.createdAt,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
