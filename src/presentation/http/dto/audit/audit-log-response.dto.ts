import {
  AuditAction,
  EntityType,
  AuditChanges,
} from '../../../../core/domain/audit/entities/audit-log.entity';

export class AuditLogResponseDto {
  id: string;
  entityType: EntityType;
  entityId: string;
  action: AuditAction;
  changes?: AuditChanges;
  performedById: string;
  performedByEmail: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  createdAt: Date;
}

export class AuditLogListResponseDto {
  items: AuditLogResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
