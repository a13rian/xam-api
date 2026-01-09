import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetUserQuery } from './get-user.query';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';

export interface GetUserResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  roleIds: string[];
  roleNames: string[];
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserQuery): Promise<GetUserResult> {
    const user = await this.userRepository.findById(query.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.genderValue,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      roleIds: [...user.roleIds],
      roleNames: [...user.roleNames],
      failedLoginAttempts: user.failedLoginAttempts,
      lockedUntil: user.lockedUntil,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
