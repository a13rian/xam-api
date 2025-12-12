import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../../../core/domain/service/entities/service.entity';
import {
  IServiceRepository,
  ServiceSearchOptions,
  ServiceSearchResult,
} from '../../../../core/domain/service/repositories/service.repository.interface';
import { ServiceOrmEntity } from '../entities/service.orm-entity';
import { ServiceMapper } from '../mappers/service.mapper';

@Injectable()
export class ServiceRepository implements IServiceRepository {
  constructor(
    @InjectRepository(ServiceOrmEntity)
    private readonly repository: Repository<ServiceOrmEntity>,
    private readonly mapper: ServiceMapper,
  ) {}

  async findById(id: string): Promise<Service | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByOrganizationId(organizationId: string): Promise<Service[]> {
    const entities = await this.repository.find({
      where: { organizationId },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findByCategoryId(categoryId: string): Promise<Service[]> {
    const entities = await this.repository.find({
      where: { categoryId },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async search(options: ServiceSearchOptions): Promise<ServiceSearchResult> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const query = this.repository.createQueryBuilder('service');

    if (options.organizationId) {
      query.andWhere('service.organizationId = :organizationId', {
        organizationId: options.organizationId,
      });
    }

    if (options.categoryId) {
      query.andWhere('service.categoryId = :categoryId', {
        categoryId: options.categoryId,
      });
    }

    if (options.isActive !== undefined) {
      query.andWhere('service.isActive = :isActive', {
        isActive: options.isActive,
      });
    }

    if (options.search) {
      query.andWhere(
        '(service.name ILIKE :search OR service.description ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    query.orderBy('service.sortOrder', 'ASC').addOrderBy('service.name', 'ASC');

    const [entities, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items: entities.map((e) => this.mapper.toDomain(e)),
      total,
      page,
      limit,
    };
  }

  async save(service: Service): Promise<void> {
    const ormEntity = this.mapper.toOrm(service);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByOrganizationIdAndName(
    organizationId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean> {
    const query = this.repository
      .createQueryBuilder('service')
      .where('service.organizationId = :organizationId', { organizationId })
      .andWhere('LOWER(service.name) = LOWER(:name)', { name });

    if (excludeId) {
      query.andWhere('service.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}
