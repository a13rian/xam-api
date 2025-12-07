import { Injectable } from '@nestjs/common';
import { Organization } from '../../../../core/domain/organization/entities/organization.entity';
import { OrganizationOrmEntity } from '../entities/organization.orm-entity';

@Injectable()
export class OrganizationMapper {
  toDomain(entity: OrganizationOrmEntity): Organization {
    return Organization.reconstitute({
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      settings: entity.settings,
      isActive: entity.isActive,
      ownerId: entity.ownerId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Organization): OrganizationOrmEntity {
    const entity = new OrganizationOrmEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.slug = domain.slug;
    entity.description = domain.description;
    entity.settings = domain.settings;
    entity.isActive = domain.isActive;
    entity.ownerId = domain.ownerId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
