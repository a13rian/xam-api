import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPartnerIndividualRepository } from '../../../../core/domain/partner/repositories/partner-individual.repository.interface';
import { PartnerIndividual } from '../../../../core/domain/partner/entities/partner-individual.entity';
import { PartnerIndividualOrmEntity } from '../entities/partner-individual.orm-entity';
import { PartnerIndividualMapper } from '../mappers/partner-individual.mapper';

@Injectable()
export class PartnerIndividualRepository implements IPartnerIndividualRepository {
  constructor(
    @InjectRepository(PartnerIndividualOrmEntity)
    private readonly ormRepository: Repository<PartnerIndividualOrmEntity>,
    private readonly mapper: PartnerIndividualMapper,
  ) {}

  async findByPartnerId(partnerId: string): Promise<PartnerIndividual | null> {
    const entity = await this.ormRepository.findOne({
      where: { partnerId },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async save(individual: PartnerIndividual): Promise<void> {
    const entity = this.mapper.toPersistence(individual);
    await this.ormRepository.save(entity);
  }

  async delete(partnerId: string): Promise<void> {
    await this.ormRepository.delete(partnerId);
  }
}
