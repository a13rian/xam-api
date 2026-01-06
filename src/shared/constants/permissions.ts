/**
 * Permission constants organized by resource.
 * Format: resource:action
 * These match the permission codes stored in the database.
 */
export const PERMISSIONS = {
  USER: {
    CREATE: 'user:create',
    READ: 'user:read',
    UPDATE: 'user:update',
    DELETE: 'user:delete',
    LIST: 'user:list',
  },
  ROLE: {
    CREATE: 'role:create',
    READ: 'role:read',
    UPDATE: 'role:update',
    DELETE: 'role:delete',
    LIST: 'role:list',
    ASSIGN: 'role:assign',
  },
  PARTNER: {
    CREATE: 'partner:create',
    READ: 'partner:read',
    UPDATE: 'partner:update',
    DELETE: 'partner:delete',
    LIST: 'partner:list',
    APPROVE: 'partner:approve',
    REJECT: 'partner:reject',
  },
  PARTNER_DOCUMENT: {
    APPROVE: 'partner_document:approve',
    REJECT: 'partner_document:reject',
  },
  CATEGORY: {
    CREATE: 'category:create',
    READ: 'category:read',
    UPDATE: 'category:update',
    DELETE: 'category:delete',
    LIST: 'category:list',
  },
  BOOKING: {
    CREATE: 'booking:create',
    READ: 'booking:read',
    UPDATE: 'booking:update',
    DELETE: 'booking:delete',
    LIST: 'booking:list',
  },
  WALLET: {
    READ: 'wallet:read',
    UPDATE: 'wallet:update',
    LIST: 'wallet:list',
  },
} as const;

export type PermissionCode =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS][keyof (typeof PERMISSIONS)[keyof typeof PERMISSIONS]];
