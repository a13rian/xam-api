import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { IPermissionRepository } from '../../../../core/domain/role/repositories/permission.repository.interface';
import { Permission } from '../../../../core/domain/role/entities/permission.entity';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';
import { PermissionMapper } from '../mappers/permission.mapper';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(PermissionOrmEntity)
    private readonly ormRepository: Repository<PermissionOrmEntity>,
    private readonly mapper: PermissionMapper,
  ) {}

  async findById(id: string): Promise<Permission | null> {
    const entity = await this.ormRepository.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<Permission | null> {
    const entity = await this.ormRepository.findOne({ where: { code } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    if (ids.length === 0) return [];
    const entities = await this.ormRepository.find({ where: { id: In(ids) } });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findByResource(resource: string): Promise<Permission[]> {
    const entities = await this.ormRepository.find({ where: { resource } });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findAll(): Promise<Permission[]> {
    const entities = await this.ormRepository.find();
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async save(permission: Permission): Promise<void> {
    const entity = this.mapper.toPersistence(permission);
    await this.ormRepository.save(entity);
  }

  async saveMany(permissions: Permission[]): Promise<void> {
    const entities = permissions.map((p) => this.mapper.toPersistence(p));
    await this.ormRepository.save(entities);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
