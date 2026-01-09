import {
  AuditAction,
  EntityType,
} from '../../../../domain/audit/entities/audit-log.entity';

export class ListAuditLogsQuery {
  constructor(
    public readonly entityType?: EntityType,
    public readonly entityId?: string,
    public readonly action?: AuditAction,
    public readonly performedById?: string,
    public readonly fromDate?: Date,
    public readonly toDate?: Date,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
