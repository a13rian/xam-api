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
  IPermissionRepository,
  PERMISSION_REPOSITORY,
} from '../../../../domain/role/repositories/permission.repository.interface';
import {
  IWalletRepository,
  WALLET_REPOSITORY,
} from '../../../../domain/wallet/repositories/wallet.repository.interface';

export interface PermissionInfo {
  id: string;
  code: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
}

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
    permissions: PermissionInfo[];
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
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
  ) {}

  async execute(query: GetMeQuery): Promise<GetMeResult> {
    const user = await this.userRepository.findById(query.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Collect all permission IDs from all roles
    const roleDataPromises = [...user.roleIds].map(async (roleId) => {
      const role = await this.roleRepository.findById(roleId);
      return role ? { role, permissionIds: [...role.permissionIds] } : null;
    });

    const [roleDataResults, wallet] = await Promise.all([
      Promise.all(roleDataPromises),
      this.walletRepository.findByUserId(query.userId),
    ]);

    const validRoleData = roleDataResults.filter(Boolean) as Array<{
      role: NonNullable<Awaited<ReturnType<IRoleRepository['findById']>>>;
      permissionIds: string[];
    }>;

    // Collect all unique permission IDs
    const allPermissionIds = [
      ...new Set(validRoleData.flatMap((rd) => rd.permissionIds)),
    ];

    // Fetch all permissions in one query
    const permissions =
      await this.permissionRepository.findByIds(allPermissionIds);
    const permissionMap = new Map(permissions.map((p) => [p.id, p]));

    // Build roles with detailed permissions
    const roles = validRoleData.map(({ role, permissionIds }) => ({
      id: role.id,
      name: role.name,
      permissions: permissionIds
        .map((id) => {
          const p = permissionMap.get(id);
          if (!p) return null;
          return {
            id: p.id,
            code: p.code,
            name: p.name,
            description: p.description,
            resource: p.resource,
            action: p.action,
          };
        })
        .filter(Boolean) as PermissionInfo[],
    }));

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
      roles,
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
