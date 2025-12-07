import { Permission } from '../entities/permission.entity';

export const PERMISSION_REPOSITORY = Symbol('IPermissionRepository');

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByCode(code: string): Promise<Permission | null>;
  findByIds(ids: string[]): Promise<Permission[]>;
  findByResource(resource: string): Promise<Permission[]>;
  findAll(): Promise<Permission[]>;
  save(permission: Permission): Promise<void>;
  saveMany(permissions: Permission[]): Promise<void>;
  delete(id: string): Promise<void>;
}
