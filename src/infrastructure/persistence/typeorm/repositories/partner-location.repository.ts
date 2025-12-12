import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, FindOptionsWhere } from 'typeorm';
import { PartnerLocation } from '../../../../core/domain/location/entities/partner-location.entity';
import { IPartnerLocationRepository } from '../../../../core/domain/location/repositories/partner-location.repository.interface';
import { OrganizationLocationOrmEntity } from '../entities/organization-location.orm-entity';
import { PartnerLocationMapper } from '../mappers/partner-location.mapper';

@Injectable()
export class PartnerLocationRepository implements IPartnerLocationRepository {
  constructor(
    @InjectRepository(OrganizationLocationOrmEntity)
    private readonly repository: Repository<OrganizationLocationOrmEntity>,
    private readonly mapper: PartnerLocationMapper,
  ) {}

  async findById(id: string): Promise<PartnerLocation | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByPartnerId(organizationId: string): Promise<PartnerLocation[]> {
    const entities = await this.repository.find({
      where: { organizationId },
      order: { isPrimary: 'DESC', name: 'ASC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findPrimaryByPartnerId(
    organizationId: string,
  ): Promise<PartnerLocation | null> {
    const entity = await this.repository.findOne({
      where: { organizationId, isPrimary: true },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async save(location: PartnerLocation): Promise<void> {
    const ormEntity = this.mapper.toOrm(location);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async clearPrimaryForPartner(
    organizationId: string,
    excludeId?: string,
  ): Promise<void> {
    const conditions: FindOptionsWhere<OrganizationLocationOrmEntity> = {
      organizationId,
      isPrimary: true,
    };
    if (excludeId) {
      conditions.id = Not(excludeId);
    }
    await this.repository.update(conditions, { isPrimary: false });
  }
}
