import { EntityType } from '../../../../domain/audit/entities/audit-log.entity';

export class GetEntityAuditLogsQuery {
  constructor(
    public readonly entityType: EntityType,
    public readonly entityId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
