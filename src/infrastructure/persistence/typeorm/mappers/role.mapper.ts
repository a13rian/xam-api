import { Injectable } from '@nestjs/common';
import { Role } from '../../../../core/domain/role/entities/role.entity';
import { RoleOrmEntity } from '../entities/role.orm-entity';

@Injectable()
export class RoleMapper {
  toDomain(entity: RoleOrmEntity): Role {
    return Role.reconstitute({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      isSystem: entity.isSystem,
      organizationId: entity.organizationId,
      permissionIds: entity.permissions?.map((p) => p.id) ?? [],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Role): RoleOrmEntity {
    const entity = new RoleOrmEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.isSystem = domain.isSystem;
    entity.organizationId = domain.organizationId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
