import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetEntityAuditLogsQuery } from './get-entity-audit-logs.query';
import {
  IAuditLogRepository,
  AUDIT_LOG_REPOSITORY,
  ListAuditLogsResult,
} from '../../../../domain/audit/repositories/audit-log.repository.interface';

@QueryHandler(GetEntityAuditLogsQuery)
export class GetEntityAuditLogsHandler implements IQueryHandler<GetEntityAuditLogsQuery> {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(query: GetEntityAuditLogsQuery): Promise<ListAuditLogsResult> {
    return await this.auditLogRepository.findAll({
      entityType: query.entityType,
      entityId: query.entityId,
      page: query.page,
      limit: query.limit,
    });
  }
}
