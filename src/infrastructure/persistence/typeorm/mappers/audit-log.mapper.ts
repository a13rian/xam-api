import { Injectable } from '@nestjs/common';
import { AuditLog } from '../../../../core/domain/audit/entities/audit-log.entity';
import { AuditLogOrmEntity } from '../entities/audit-log.orm-entity';

@Injectable()
export class AuditLogMapper {
  toDomain(ormEntity: AuditLogOrmEntity): AuditLog {
    return AuditLog.reconstitute({
      id: ormEntity.id,
      entityType: ormEntity.entityType,
      entityId: ormEntity.entityId,
      action: ormEntity.action,
      changes: ormEntity.changes || undefined,
      performedById: ormEntity.performedById,
      performedByEmail: ormEntity.performedByEmail,
      ipAddress: ormEntity.ipAddress || undefined,
      userAgent: ormEntity.userAgent || undefined,
      requestId: ormEntity.requestId || undefined,
      createdAt: ormEntity.createdAt,
    });
  }

  toOrm(domainEntity: AuditLog): AuditLogOrmEntity {
    const ormEntity = new AuditLogOrmEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.entityType = domainEntity.entityType;
    ormEntity.entityId = domainEntity.entityId;
    ormEntity.action = domainEntity.action;
    ormEntity.changes = domainEntity.changes || null;
    ormEntity.performedById = domainEntity.performedById;
    ormEntity.performedByEmail = domainEntity.performedByEmail;
    ormEntity.ipAddress = domainEntity.ipAddress || null;
    ormEntity.userAgent = domainEntity.userAgent || null;
    ormEntity.requestId = domainEntity.requestId || null;
    ormEntity.createdAt = domainEntity.createdAt;
    return ormEntity;
  }
}
