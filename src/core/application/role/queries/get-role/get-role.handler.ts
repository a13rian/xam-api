import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetRoleQuery } from './get-role.query';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../../../domain/role/repositories/role.repository.interface';

export interface GetRoleResult {
  id: string;
  name: string;
  description: string | null;
  organizationId: string | null;
  isSystem: boolean;
  permissionIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetRoleQuery)
export class GetRoleHandler implements IQueryHandler<GetRoleQuery> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(query: GetRoleQuery): Promise<GetRoleResult> {
    const role = await this.roleRepository.findById(query.id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      organizationId: role.organizationId,
      isSystem: role.isSystem,
      permissionIds: [...role.permissionIds],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
