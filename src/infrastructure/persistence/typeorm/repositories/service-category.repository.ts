import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ServiceCategory } from '../../../../core/domain/service/entities/service-category.entity';
import { IServiceCategoryRepository } from '../../../../core/domain/service/repositories/service-category.repository.interface';
import { ServiceCategoryOrmEntity } from '../entities/service-category.orm-entity';
import { ServiceCategoryMapper } from '../mappers/service-category.mapper';

@Injectable()
export class ServiceCategoryRepository implements IServiceCategoryRepository {
  constructor(
    @InjectRepository(ServiceCategoryOrmEntity)
    private readonly repository: Repository<ServiceCategoryOrmEntity>,
    private readonly mapper: ServiceCategoryMapper,
  ) {}

  async findById(id: string): Promise<ServiceCategory | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findBySlug(slug: string): Promise<ServiceCategory | null> {
    const entity = await this.repository.findOne({ where: { slug } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByParentId(parentId: string | null): Promise<ServiceCategory[]> {
    const entities = await this.repository.find({
      where: { parentId: parentId ?? IsNull() },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findAll(options?: {
    includeInactive?: boolean;
  }): Promise<ServiceCategory[]> {
    const query = this.repository.createQueryBuilder('category');

    if (!options?.includeInactive) {
      query.where('category.isActive = :isActive', { isActive: true });
    }

    query
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.name', 'ASC');

    const entities = await query.getMany();
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findRootCategories(options?: {
    includeInactive?: boolean;
  }): Promise<ServiceCategory[]> {
    const query = this.repository
      .createQueryBuilder('category')
      .where('category.parentId IS NULL');

    if (!options?.includeInactive) {
      query.andWhere('category.isActive = :isActive', { isActive: true });
    }

    query
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.name', 'ASC');

    const entities = await query.getMany();
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async save(category: ServiceCategory): Promise<void> {
    const ormEntity = this.mapper.toOrm(category);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const query = this.repository
      .createQueryBuilder('category')
      .where('category.slug = :slug', { slug });

    if (excludeId) {
      query.andWhere('category.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}
