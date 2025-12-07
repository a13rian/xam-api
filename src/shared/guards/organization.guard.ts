import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class OrganizationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    // Extract organization from route params or body
    const requestedOrgId =
      request.params.organizationId ||
      (request.body as Record<string, unknown>)?.organizationId ||
      request.query?.organizationId;

    // If no org in request, allow (will use user's default org)
    if (!requestedOrgId) {
      return true;
    }

    // Super admin can access any organization (check by role ID)
    // Note: In production, resolve role IDs to names or use a known super_admin role ID
    if (user?.roleIds && user.roleIds.length > 0) {
      // For now, allow access - full role checking should be done via RolesGuard
    }

    // Check if user belongs to the requested organization
    if (user?.organizationId !== requestedOrgId) {
      throw new ForbiddenException('Access denied to this organization');
    }

    return true;
  }
}
