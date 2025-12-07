import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListPermissionsQuery } from './list-permissions.query';
import {
  IPermissionRepository,
  PERMISSION_REPOSITORY,
} from '../../../../domain/role/repositories/permission.repository.interface';
import { Permission } from '../../../../domain/role/entities/permission.entity';

export interface PermissionListItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
}

export interface ListPermissionsResult {
  items: PermissionListItem[];
}

@QueryHandler(ListPermissionsQuery)
export class ListPermissionsHandler implements IQueryHandler<ListPermissionsQuery> {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(query: ListPermissionsQuery): Promise<ListPermissionsResult> {
    let permissions: Permission[];

    if (query.resource) {
      permissions = await this.permissionRepository.findByResource(
        query.resource,
      );
    } else {
      permissions = await this.permissionRepository.findAll();
    }

    const items: PermissionListItem[] = permissions.map((permission) => ({
      id: permission.id,
      code: permission.code,
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
    }));

    return { items };
  }
}
