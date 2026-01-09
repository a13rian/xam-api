import {
  AuditLog,
  AuditAction,
  EntityType,
} from '../entities/audit-log.entity';

export const AUDIT_LOG_REPOSITORY = Symbol('AUDIT_LOG_REPOSITORY');

export interface ListAuditLogsParams {
  entityType?: EntityType;
  entityId?: string;
  action?: AuditAction;
  performedById?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

export interface ListAuditLogsResult {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAuditLogRepository {
  save(auditLog: AuditLog): Promise<void>;
  findById(id: string): Promise<AuditLog | null>;
  findByEntityId(entityType: EntityType, entityId: string): Promise<AuditLog[]>;
  findAll(params: ListAuditLogsParams): Promise<ListAuditLogsResult>;
}
