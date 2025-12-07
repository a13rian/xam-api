import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { IRoleRepository } from '../../../../core/domain/role/repositories/role.repository.interface';
import { Role } from '../../../../core/domain/role/entities/role.entity';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly ormRepository: Repository<RoleOrmEntity>,
    @InjectRepository(PermissionOrmEntity)
    private readonly permissionRepository: Repository<PermissionOrmEntity>,
    private readonly mapper: RoleMapper,
  ) {}

  async findById(id: string): Promise<Role | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByIds(ids: string[]): Promise<Role[]> {
    if (ids.length === 0) return [];
    const entities = await this.ormRepository.find({
      where: { id: In(ids) },
      relations: ['permissions'],
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findByName(
    name: string,
    organizationId?: string | null,
  ): Promise<Role | null> {
    const entity = await this.ormRepository.findOne({
      where: {
        name,
        organizationId: organizationId === null ? IsNull() : organizationId,
      },
      relations: ['permissions'],
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByOrganization(organizationId: string | null): Promise<Role[]> {
    const entities = await this.ormRepository.find({
      where: {
        organizationId: organizationId === null ? IsNull() : organizationId,
      },
      relations: ['permissions'],
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findSystemRoles(): Promise<Role[]> {
    const entities = await this.ormRepository.find({
      where: { isSystem: true },
      relations: ['permissions'],
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async save(role: Role): Promise<void> {
    const entity = this.mapper.toPersistence(role);

    if (role.permissionIds.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: { id: In([...role.permissionIds]) },
      });
      entity.permissions = permissions;
    } else {
      entity.permissions = [];
    }

    await this.ormRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async exists(name: string, organizationId?: string | null): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: {
        name,
        organizationId: organizationId === null ? IsNull() : organizationId,
      },
    });
    return count > 0;
  }
}
