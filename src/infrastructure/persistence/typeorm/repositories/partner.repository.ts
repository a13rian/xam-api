import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPartnerRepository } from '../../../../core/domain/partner/repositories/partner.repository.interface';
import { Partner } from '../../../../core/domain/partner/entities/partner.entity';
import { PartnerStatusEnum } from '../../../../core/domain/partner/value-objects/partner-status.vo';
import { PaginationOptions } from '../../../../shared/interfaces/pagination.interface';
import { PartnerOrmEntity } from '../entities/partner.orm-entity';
import { PartnerMapper } from '../mappers/partner.mapper';

@Injectable()
export class PartnerRepository implements IPartnerRepository {
  constructor(
    @InjectRepository(PartnerOrmEntity)
    private readonly ormRepository: Repository<PartnerOrmEntity>,
    private readonly mapper: PartnerMapper,
  ) {}

  async findById(id: string): Promise<Partner | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Partner | null> {
    const entity = await this.ormRepository.findOne({
      where: { userId },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByStatus(
    status: PartnerStatusEnum,
    options?: PaginationOptions,
  ): Promise<Partner[]> {
    const entities = await this.ormRepository.find({
      where: { status },
      take: options?.limit ?? 50,
      skip: ((options?.page ?? 1) - 1) * (options?.limit ?? 50),
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countByStatus(status: PartnerStatusEnum): Promise<number> {
    return this.ormRepository.count({ where: { status } });
  }

  async findAll(options?: PaginationOptions): Promise<Partner[]> {
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

  async save(partner: Partner): Promise<void> {
    const entity = this.mapper.toPersistence(partner);
    await this.ormRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async exists(userId: string): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { userId },
    });
    return count > 0;
  }
}
