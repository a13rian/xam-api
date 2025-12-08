import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPartnerDocumentRepository } from '../../../../core/domain/partner/repositories/partner-document.repository.interface';
import {
  PartnerDocument,
  DocumentStatusEnum,
} from '../../../../core/domain/partner/entities/partner-document.entity';
import { PartnerDocumentOrmEntity } from '../entities/partner-document.orm-entity';
import { PartnerDocumentMapper } from '../mappers/partner-document.mapper';

@Injectable()
export class PartnerDocumentRepository implements IPartnerDocumentRepository {
  constructor(
    @InjectRepository(PartnerDocumentOrmEntity)
    private readonly ormRepository: Repository<PartnerDocumentOrmEntity>,
    private readonly mapper: PartnerDocumentMapper,
  ) {}

  async findById(id: string): Promise<PartnerDocument | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByPartnerId(partnerId: string): Promise<PartnerDocument[]> {
    const entities = await this.ormRepository.find({
      where: { partnerId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findByPartnerIdAndStatus(
    partnerId: string,
    status: DocumentStatusEnum,
  ): Promise<PartnerDocument[]> {
    const entities = await this.ormRepository.find({
      where: { partnerId, status },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async save(document: PartnerDocument): Promise<void> {
    const entity = this.mapper.toPersistence(document);
    await this.ormRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
