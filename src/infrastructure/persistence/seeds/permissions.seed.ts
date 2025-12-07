import { DataSource } from 'typeorm';
import { PermissionOrmEntity } from '../typeorm/entities/permission.orm-entity';
import { v4 as uuidv4 } from 'uuid';

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
    entity.id = uuidv4();
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
