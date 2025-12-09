import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import {
  ROLE_REPOSITORY,
  IRoleRepository,
} from '@core/domain/role/repositories/role.repository.interface';

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly requestCache = new WeakMap<Request, string[]>();

  constructor(
    private readonly reflector: Reflector,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw new ForbiddenException('Access denied - user not authenticated');
    }

    if (!user.roleIds || user.roleIds.length === 0) {
      throw new ForbiddenException('Access denied - no roles assigned');
    }

    const userPermissions = await this.getUserPermissions(
      request,
      user.roleIds,
    );

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }

  private async getUserPermissions(
    request: Request,
    roleIds: string[],
  ): Promise<string[]> {
    const cached = this.requestCache.get(request);
    if (cached) {
      return cached;
    }

    const permissions =
      await this.roleRepository.getPermissionCodesByRoleIds(roleIds);

    this.requestCache.set(request, permissions);

    return permissions;
  }
}
