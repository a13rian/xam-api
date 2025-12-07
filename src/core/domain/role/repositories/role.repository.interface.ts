import { Role } from '../entities/role.entity';

export const ROLE_REPOSITORY = Symbol('IRoleRepository');

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByIds(ids: string[]): Promise<Role[]>;
  findByName(
    name: string,
    organizationId?: string | null,
  ): Promise<Role | null>;
  findByOrganization(organizationId: string | null): Promise<Role[]>;
  findSystemRoles(): Promise<Role[]>;
  save(role: Role): Promise<void>;
  delete(id: string): Promise<void>;
  exists(name: string, organizationId?: string | null): Promise<boolean>;
}
