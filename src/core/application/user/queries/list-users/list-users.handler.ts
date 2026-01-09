import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListUsersQuery } from './list-users.query';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  roleNames: readonly string[];
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
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
    const {
      page,
      limit,
      search,
      isActive,
      roleId,
      isEmailVerified,
      createdFrom,
      createdTo,
      lastLoginFrom,
      lastLoginTo,
      sortBy,
      sortOrder,
    } = query;

    const filterOptions = {
      search,
      isActive,
      roleId,
      isEmailVerified,
      createdFrom,
      createdTo,
      lastLoginFrom,
      lastLoginTo,
    };

    const users = await this.userRepository.findAll({
      page,
      limit,
      ...filterOptions,
      sortBy,
      sortOrder,
    });
    const total = await this.userRepository.countAll(filterOptions);

    const items: UserListItem[] = users.map((user) => ({
      id: user.id,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      roleNames: [...user.roleNames],
      failedLoginAttempts: user.failedLoginAttempts,
      lockedUntil: user.lockedUntil,
      lastLoginAt: user.lastLoginAt,
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
