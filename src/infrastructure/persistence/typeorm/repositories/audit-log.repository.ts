import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IAuditLogRepository,
  ListAuditLogsParams,
  ListAuditLogsResult,
} from '../../../../core/domain/audit/repositories/audit-log.repository.interface';
import {
  AuditLog,
  EntityType,
} from '../../../../core/domain/audit/entities/audit-log.entity';
import { AuditLogOrmEntity } from '../entities/audit-log.orm-entity';
import { AuditLogMapper } from '../mappers/audit-log.mapper';

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @InjectRepository(AuditLogOrmEntity)
    private readonly repository: Repository<AuditLogOrmEntity>,
    private readonly mapper: AuditLogMapper,
  ) {}

  async save(auditLog: AuditLog): Promise<void> {
    const ormEntity = this.mapper.toOrm(auditLog);
    await this.repository.save(ormEntity);
  }

  async findById(id: string): Promise<AuditLog | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? this.mapper.toDomain(ormEntity) : null;
  }

  async findByEntityId(
    entityType: EntityType,
    entityId: string,
  ): Promise<AuditLog[]> {
    const ormEntities = await this.repository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((e) => this.mapper.toDomain(e));
  }

  async findAll(params: ListAuditLogsParams): Promise<ListAuditLogsResult> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder('audit');

    if (params.entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', {
        entityType: params.entityType,
      });
    }

    if (params.entityId) {
      queryBuilder.andWhere('audit.entityId = :entityId', {
        entityId: params.entityId,
      });
    }

    if (params.action) {
      queryBuilder.andWhere('audit.action = :action', {
        action: params.action,
      });
    }

    if (params.performedById) {
      queryBuilder.andWhere('audit.performedById = :performedById', {
        performedById: params.performedById,
      });
    }

    if (params.fromDate) {
      queryBuilder.andWhere('audit.createdAt >= :fromDate', {
        fromDate: params.fromDate,
      });
    }

    if (params.toDate) {
      queryBuilder.andWhere('audit.createdAt <= :toDate', {
        toDate: params.toDate,
      });
    }

    queryBuilder.orderBy('audit.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items: items.map((e) => this.mapper.toDomain(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
