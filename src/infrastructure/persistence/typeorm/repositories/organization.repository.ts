import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrganizationRepository } from '../../../../core/domain/organization/repositories/organization.repository.interface';
import { Organization } from '../../../../core/domain/organization/entities/organization.entity';
import { PaginationOptions } from '../../../../shared/interfaces/pagination.interface';
import { OrganizationOrmEntity } from '../entities/organization.orm-entity';
import { OrganizationMapper } from '../mappers/organization.mapper';

@Injectable()
export class OrganizationRepository implements IOrganizationRepository {
  constructor(
    @InjectRepository(OrganizationOrmEntity)
    private readonly ormRepository: Repository<OrganizationOrmEntity>,
    private readonly mapper: OrganizationMapper,
  ) {}

  async findById(id: string): Promise<Organization | null> {
    const entity = await this.ormRepository.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const entity = await this.ormRepository.findOne({ where: { slug } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Organization[]> {
    const entities = await this.ormRepository.find({ where: { ownerId } });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findAll(options?: PaginationOptions): Promise<Organization[]> {
    const entities = await this.ormRepository.find({
      take: options?.limit ?? 50,
      skip: ((options?.page ?? 1) - 1) * (options?.limit ?? 50),
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countAll(): Promise<number> {
    return this.ormRepository.count();
  }

  async save(organization: Organization): Promise<void> {
    const entity = this.mapper.toPersistence(organization);
    await this.ormRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.ormRepository.count({ where: { slug } });
    return count > 0;
  }
}
