import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPartnerBusinessRepository } from '../../../../core/domain/partner/repositories/partner-business.repository.interface';
import { PartnerBusiness } from '../../../../core/domain/partner/entities/partner-business.entity';
import { PartnerBusinessOrmEntity } from '../entities/partner-business.orm-entity';
import { PartnerBusinessMapper } from '../mappers/partner-business.mapper';

@Injectable()
export class PartnerBusinessRepository implements IPartnerBusinessRepository {
  constructor(
    @InjectRepository(PartnerBusinessOrmEntity)
    private readonly ormRepository: Repository<PartnerBusinessOrmEntity>,
    private readonly mapper: PartnerBusinessMapper,
  ) {}

  async findByPartnerId(partnerId: string): Promise<PartnerBusiness | null> {
    const entity = await this.ormRepository.findOne({
      where: { partnerId },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async save(business: PartnerBusiness): Promise<void> {
    const entity = this.mapper.toPersistence(business);
    await this.ormRepository.save(entity);
  }

  async delete(partnerId: string): Promise<void> {
    await this.ormRepository.delete(partnerId);
  }
}
