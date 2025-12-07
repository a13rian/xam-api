import { Injectable } from '@nestjs/common';
import { Permission } from '../../../../core/domain/role/entities/permission.entity';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';

@Injectable()
export class PermissionMapper {
  toDomain(entity: PermissionOrmEntity): Permission {
    return Permission.reconstitute({
      id: entity.id,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      resource: entity.resource,
      action: entity.action,
      createdAt: entity.createdAt,
    });
  }

  toPersistence(domain: Permission): PermissionOrmEntity {
    const entity = new PermissionOrmEntity();
    entity.id = domain.id;
    entity.code = domain.code;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.resource = domain.resource;
    entity.action = domain.action;
    entity.createdAt = domain.createdAt;
    return entity;
  }
}
