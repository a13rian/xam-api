import { DataSource } from 'typeorm';
import { PermissionOrmEntity } from '../typeorm/entities/permission.orm-entity';

const permissions = [
  // User permissions
  {
    code: 'user:create',
    name: 'Create User',
    description: 'Create new users',
    resource: 'user',
    action: 'create',
  },
  {
    code: 'user:read',
    name: 'Read User',
    description: 'View user details',
    resource: 'user',
    action: 'read',
  },
  {
    code: 'user:update',
    name: 'Update User',
    description: 'Update user information',
    resource: 'user',
    action: 'update',
  },
  {
    code: 'user:delete',
    name: 'Delete User',
    description: 'Delete users',
    resource: 'user',
    action: 'delete',
  },
  {
    code: 'user:list',
    name: 'List Users',
    description: 'View list of users',
    resource: 'user',
    action: 'list',
  },

  // Organization permissions
  {
    code: 'organization:create',
    name: 'Create Organization',
    description: 'Create new organizations',
    resource: 'organization',
    action: 'create',
  },
  {
    code: 'organization:read',
    name: 'Read Organization',
    description: 'View organization details',
    resource: 'organization',
    action: 'read',
  },
  {
    code: 'organization:update',
    name: 'Update Organization',
    description: 'Update organization information',
    resource: 'organization',
    action: 'update',
  },
  {
    code: 'organization:delete',
    name: 'Delete Organization',
    description: 'Delete organizations',
    resource: 'organization',
    action: 'delete',
  },
  {
    code: 'organization:list',
    name: 'List Organizations',
    description: 'View list of organizations',
    resource: 'organization',
    action: 'list',
  },

  // Role permissions
  {
    code: 'role:create',
    name: 'Create Role',
    description: 'Create new roles',
    resource: 'role',
    action: 'create',
  },
  {
    code: 'role:read',
    name: 'Read Role',
    description: 'View role details',
    resource: 'role',
    action: 'read',
  },
  {
    code: 'role:update',
    name: 'Update Role',
    description: 'Update role information',
    resource: 'role',
    action: 'update',
  },
  {
    code: 'role:delete',
    name: 'Delete Role',
    description: 'Delete roles',
    resource: 'role',
    action: 'delete',
  },
  {
    code: 'role:list',
    name: 'List Roles',
    description: 'View list of roles',
    resource: 'role',
    action: 'list',
  },
  {
    code: 'role:assign',
    name: 'Assign Role',
    description: 'Assign roles to users',
    resource: 'role',
    action: 'assign',
  },

  // Partner permissions
  {
    code: 'partner:create',
    name: 'Create Partner',
    description: 'Create new partners',
    resource: 'partner',
    action: 'create',
  },
  {
    code: 'partner:read',
    name: 'Read Partner',
    description: 'View partner details',
    resource: 'partner',
    action: 'read',
  },
  {
    code: 'partner:update',
    name: 'Update Partner',
    description: 'Update partner information',
    resource: 'partner',
    action: 'update',
  },
  {
    code: 'partner:delete',
    name: 'Delete Partner',
    description: 'Delete partners',
    resource: 'partner',
    action: 'delete',
  },
  {
    code: 'partner:list',
    name: 'List Partners',
    description: 'View list of partners',
    resource: 'partner',
    action: 'list',
  },
  {
    code: 'partner:approve',
    name: 'Approve Partner',
    description: 'Approve partner applications',
    resource: 'partner',
    action: 'approve',
  },
  {
    code: 'partner:reject',
    name: 'Reject Partner',
    description: 'Reject partner applications',
    resource: 'partner',
    action: 'reject',
  },

  // Partner Document permissions
  {
    code: 'partner_document:approve',
    name: 'Approve Partner Document',
    description: 'Approve partner documents',
    resource: 'partner_document',
    action: 'approve',
  },
  {
    code: 'partner_document:reject',
    name: 'Reject Partner Document',
    description: 'Reject partner documents',
    resource: 'partner_document',
    action: 'reject',
  },

  // Category permissions
  {
    code: 'category:create',
    name: 'Create Category',
    description: 'Create new categories',
    resource: 'category',
    action: 'create',
  },
  {
    code: 'category:read',
    name: 'Read Category',
    description: 'View category details',
    resource: 'category',
    action: 'read',
  },
  {
    code: 'category:update',
    name: 'Update Category',
    description: 'Update category information',
    resource: 'category',
    action: 'update',
  },
  {
    code: 'category:delete',
    name: 'Delete Category',
    description: 'Delete categories',
    resource: 'category',
    action: 'delete',
  },
  {
    code: 'category:list',
    name: 'List Categories',
    description: 'View list of categories',
    resource: 'category',
    action: 'list',
  },

  // Booking permissions
  {
    code: 'booking:create',
    name: 'Create Booking',
    description: 'Create new bookings',
    resource: 'booking',
    action: 'create',
  },
  {
    code: 'booking:read',
    name: 'Read Booking',
    description: 'View booking details',
    resource: 'booking',
    action: 'read',
  },
  {
    code: 'booking:update',
    name: 'Update Booking',
    description: 'Update booking information',
    resource: 'booking',
    action: 'update',
  },
  {
    code: 'booking:delete',
    name: 'Delete Booking',
    description: 'Delete bookings',
    resource: 'booking',
    action: 'delete',
  },
  {
    code: 'booking:list',
    name: 'List Bookings',
    description: 'View list of bookings',
    resource: 'booking',
    action: 'list',
  },

  // Wallet permissions
  {
    code: 'wallet:read',
    name: 'Read Wallet',
    description: 'View wallet details',
    resource: 'wallet',
    action: 'read',
  },
  {
    code: 'wallet:update',
    name: 'Update Wallet',
    description: 'Update wallet balance',
    resource: 'wallet',
    action: 'update',
  },
  {
    code: 'wallet:list',
    name: 'List Wallets',
    description: 'View list of wallets',
    resource: 'wallet',
    action: 'list',
  },
];

export async function seedPermissions(
  dataSource: DataSource,
): Promise<PermissionOrmEntity[]> {
  const permissionRepository = dataSource.getRepository(PermissionOrmEntity);
  const existingPermissions = await permissionRepository.find();

  if (existingPermissions.length > 0) {
    console.log('Permissions already seeded');
    return existingPermissions;
  }

  const permissionEntities = permissions.map((p) => {
    const entity = new PermissionOrmEntity();
    entity.code = p.code;
    entity.name = p.name;
    entity.description = p.description;
    entity.resource = p.resource;
    entity.action = p.action;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    return entity;
  });

  await permissionRepository.save(permissionEntities);
  console.log(`Seeded ${permissionEntities.length} permissions`);

  return permissionEntities;
}
