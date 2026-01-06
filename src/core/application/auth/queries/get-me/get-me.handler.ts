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
import {
  IWalletRepository,
  WALLET_REPOSITORY,
} from '../../../../domain/wallet/repositories/wallet.repository.interface';

export interface GetMeResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  phone: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  roles: Array<{
    id: string;
    name: string;
    permissions: string[];
  }>;
  wallet: {
    id: string;
    balance: number;
    currency: string;
  } | null;
  createdAt: Date;
}

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
  ) {}

  async execute(query: GetMeQuery): Promise<GetMeResult> {
    const user = await this.userRepository.findById(query.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [roles, wallet] = await Promise.all([
      Promise.all(
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
      ),
      this.walletRepository.findByUserId(query.userId),
    ]);

    return {
      id: user.id,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.genderValue,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      roles: roles.filter(Boolean) as Array<{
        id: string;
        name: string;
        permissions: string[];
      }>,
      wallet: wallet
        ? {
            id: wallet.id,
            balance: wallet.balance.amount,
            currency: wallet.balance.currency,
          }
        : null,
      createdAt: user.createdAt,
    };
  }
}
