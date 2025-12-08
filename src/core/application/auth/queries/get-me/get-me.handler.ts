import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetMeQuery } from './get-me.query';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../../../domain/role/repositories/role.repository.interface';

export interface GetMeResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  roles: Array<{
    id: string;
    name: string;
    permissions: string[];
  }>;
  createdAt: Date;
}

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(query: GetMeQuery): Promise<GetMeResult> {
    const user = await this.userRepository.findById(query.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = await Promise.all(
      [...user.roleIds].map(async (roleId) => {
        const role = await this.roleRepository.findById(roleId);
        if (role) {
          return {
            id: role.id,
            name: role.name,
            permissions: [...role.permissionIds],
          };
        }
        return null;
      }),
    );

    return {
      id: user.id,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      roles: roles.filter(Boolean) as Array<{
        id: string;
        name: string;
        permissions: string[];
      }>,
      createdAt: user.createdAt,
    };
  }
}
