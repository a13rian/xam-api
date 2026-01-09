import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListAuditLogsQuery } from './list-audit-logs.query';
import {
  IAuditLogRepository,
  AUDIT_LOG_REPOSITORY,
  ListAuditLogsResult,
} from '../../../../domain/audit/repositories/audit-log.repository.interface';

@QueryHandler(ListAuditLogsQuery)
export class ListAuditLogsHandler implements IQueryHandler<ListAuditLogsQuery> {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(query: ListAuditLogsQuery): Promise<ListAuditLogsResult> {
    return await this.auditLogRepository.findAll({
      entityType: query.entityType,
      entityId: query.entityId,
      action: query.action,
      performedById: query.performedById,
      fromDate: query.fromDate,
      toDate: query.toDate,
      page: query.page,
      limit: query.limit,
    });
  }
}
