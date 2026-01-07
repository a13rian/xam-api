import { DataSource } from 'typeorm';
import { PermissionOrmEntity } from '../typeorm/entities/permission.orm-entity';
import { RoleOrmEntity } from '../typeorm/entities/role.orm-entity';

interface RoleSeedConfig {
  name: string;
  description: string;
  isSystem: boolean;
  permissionCodes: string[];
}

const roles: RoleSeedConfig[] = [
  {
    name: 'super_admin',
    description: 'Super Administrator with full system access',
    isSystem: true,
    permissionCodes: ['*'],
  },
  {
    name: 'admin',
    description: 'Administrator with organization management capabilities',
    isSystem: true,
    permissionCodes: [
      'user:create',
      'user:read',
      'user:update',
      'user:delete',
      'user:list',
      'organization:read',
      'organization:update',
      'role:create',
      'role:read',
      'role:update',
      'role:delete',
      'role:list',
      'role:assign',
      'partner:create',
      'partner:read',
      'partner:update',
      'partner:delete',
      'partner:list',
      'partner:approve',
      'partner:reject',
      'partner_document:approve',
      'partner_document:reject',
      'category:create',
      'category:read',
      'category:update',
      'category:delete',
      'category:list',
      // Booking permissions
      'booking:create',
      'booking:read',
      'booking:update',
      'booking:delete',
      'booking:list',
      // Wallet permissions
      'wallet:read',
      'wallet:update',
      'wallet:list',
    ],
  },
  {
    name: 'member',
    description: 'Regular organization member with limited access',
    isSystem: true,
    permissionCodes: ['organization:read', 'role:read', 'role:list'],
  },
  {
    name: 'user',
    description: 'Default role for registered users',
    isSystem: true,
    permissionCodes: [],
  },
];

export async function seedRoles(
  dataSource: DataSource,
  permissions: PermissionOrmEntity[],
): Promise<RoleOrmEntity[]> {
  const roleRepository = dataSource.getRepository(RoleOrmEntity);
  const existingRoles = await roleRepository.find();

  if (existingRoles.length > 0) {
    console.log('Roles already seeded');
    return existingRoles;
  }

  const roleEntities: RoleOrmEntity[] = [];

  for (const roleConfig of roles) {
    const entity = new RoleOrmEntity();
    entity.name = roleConfig.name;
    entity.description = roleConfig.description;
    entity.isSystem = roleConfig.isSystem;
    entity.organizationId = null;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    if (roleConfig.permissionCodes.includes('*')) {
      entity.permissions = permissions;
    } else {
      entity.permissions = permissions.filter((p) =>
        roleConfig.permissionCodes.includes(p.code),
      );
    }

    roleEntities.push(entity);
  }

  await roleRepository.save(roleEntities);
  console.log(`Seeded ${roleEntities.length} roles`);

  return roleEntities;
}
