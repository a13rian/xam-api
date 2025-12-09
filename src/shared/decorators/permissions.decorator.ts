import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require specific permissions for an endpoint.
 * User must have ALL specified permissions to access the endpoint.
 *
 * @example
 * @RequirePermissions(PERMISSIONS.USER.CREATE)
 * @RequirePermissions(PERMISSIONS.USER.READ, PERMISSIONS.USER.LIST)
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
