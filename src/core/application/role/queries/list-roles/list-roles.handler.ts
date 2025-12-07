import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListRolesQuery } from './list-roles.query';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../../../domain/role/repositories/role.repository.interface';
import { Role } from '../../../../domain/role/entities/role.entity';

export interface RoleListItem {
  id: string;
  name: string;
  description: string | null;
  organizationId: string | null;
  isSystem: boolean;
  permissionCount: number;
  createdAt: Date;
}

export interface ListRolesResult {
  items: RoleListItem[];
}

@QueryHandler(ListRolesQuery)
export class ListRolesHandler implements IQueryHandler<ListRolesQuery> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(query: ListRolesQuery): Promise<ListRolesResult> {
    const { organizationId, includeSystemRoles } = query;

    let roles: Role[];

    if (organizationId !== undefined) {
      roles = await this.roleRepository.findByOrganization(organizationId);
    } else {
      roles = await this.roleRepository.findSystemRoles();
    }

    if (includeSystemRoles && organizationId !== undefined) {
      const systemRoles = await this.roleRepository.findSystemRoles();
      roles = [...roles, ...systemRoles];
    }

    const items: RoleListItem[] = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      organizationId: role.organizationId,
      isSystem: role.isSystem,
      permissionCount: role.permissionIds.length,
      createdAt: role.createdAt,
    }));

    return { items };
  }
}
