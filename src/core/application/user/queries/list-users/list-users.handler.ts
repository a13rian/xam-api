import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListUsersQuery } from './list-users.query';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import { User } from '../../../../domain/user/entities/user.entity';

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
}

export interface ListUsersResult {
  items: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: ListUsersQuery): Promise<ListUsersResult> {
    const { organizationId, page, limit } = query;

    let users: User[];
    let total: number;

    if (organizationId) {
      users = await this.userRepository.findByOrganization(organizationId, {
        page,
        limit,
      });
      total = await this.userRepository.countByOrganization(organizationId);
    } else {
      users = await this.userRepository.findAll({ page, limit });
      total = await this.userRepository.countAll();
    }

    const items: UserListItem[] = users.map((user) => ({
      id: user.id,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organizationId,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
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
