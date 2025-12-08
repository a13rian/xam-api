import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { PartnerLocation } from '../../../../core/domain/location/entities/partner-location.entity';
import { IPartnerLocationRepository } from '../../../../core/domain/location/repositories/partner-location.repository.interface';
import { PartnerLocationOrmEntity } from '../entities/partner-location.orm-entity';
import { PartnerLocationMapper } from '../mappers/partner-location.mapper';

@Injectable()
export class PartnerLocationRepository implements IPartnerLocationRepository {
  constructor(
    @InjectRepository(PartnerLocationOrmEntity)
    private readonly repository: Repository<PartnerLocationOrmEntity>,
    private readonly mapper: PartnerLocationMapper,
  ) {}

  async findById(id: string): Promise<PartnerLocation | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByPartnerId(partnerId: string): Promise<PartnerLocation[]> {
    const entities = await this.repository.find({
      where: { partnerId },
      order: { isPrimary: 'DESC', name: 'ASC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findPrimaryByPartnerId(
    partnerId: string,
  ): Promise<PartnerLocation | null> {
    const entity = await this.repository.findOne({
      where: { partnerId, isPrimary: true },
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
    partnerId: string,
    excludeId?: string,
  ): Promise<void> {
    const conditions: any = { partnerId, isPrimary: true };
    if (excludeId) {
      conditions.id = Not(excludeId);
    }
    await this.repository.update(conditions, { isPrimary: false });
  }
}
