import { v4 as uuidv4 } from 'uuid';
import { DatabaseHelper } from '../database/database.helper';
import { RoleOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/role.orm-entity';
import { PermissionOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/permission.orm-entity';

export interface CreateRoleOptions {
  name?: string;
  description?: string;
  organizationId?: string | null;
  isSystem?: boolean;
  permissionCodes?: string[];
}

let roleCounter = 0;

export class RoleFactory {
  constructor(private readonly db: DatabaseHelper) {}

  async create(options: CreateRoleOptions = {}): Promise<RoleOrmEntity> {
    roleCounter++;
    const roleRepo = this.db.getRepository(RoleOrmEntity);
    const permissionRepo = this.db.getRepository(PermissionOrmEntity);

    const permissions: PermissionOrmEntity[] = [];
    if (options.permissionCodes?.length) {
      for (const code of options.permissionCodes) {
        const permission = await permissionRepo.findOne({ where: { code } });
        if (permission) {
          permissions.push(permission);
        }
      }
    }

    const role = roleRepo.create({
      id: uuidv4(),
      name: options.name || `custom-role-${roleCounter}-${Date.now()}`,
      description: options.description || `Custom role ${roleCounter}`,
      organizationId: options.organizationId ?? null,
      isSystem: options.isSystem ?? false,
      permissions,
    });

    await roleRepo.save(role);
    return role;
  }

  async getSystemRole(name: string): Promise<RoleOrmEntity | null> {
    const roleRepo = this.db.getRepository(RoleOrmEntity);
    return roleRepo.findOne({
      where: { name, isSystem: true },
      relations: ['permissions'],
    });
  }

  async getAllPermissions(): Promise<PermissionOrmEntity[]> {
    const permissionRepo = this.db.getRepository(PermissionOrmEntity);
    return permissionRepo.find();
  }
}
