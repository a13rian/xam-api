import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { ListAuditLogsQueryDto, AuditLogListResponseDto } from '../dto/audit';
import { ListAuditLogsQuery } from '../../../core/application/audit/queries';
import { ListAuditLogsResult } from '../../../core/domain/audit/repositories/audit-log.repository.interface';

@ApiTags('audit')
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @RequirePermissions(PERMISSIONS.AUDIT.LIST)
  @ApiOperation({ summary: 'List audit logs (Admin only)' })
  async listAuditLogs(
    @Query() query: ListAuditLogsQueryDto,
  ): Promise<AuditLogListResponseDto> {
    const result = await this.queryBus.execute<
      ListAuditLogsQuery,
      ListAuditLogsResult
    >(
      new ListAuditLogsQuery(
        query.entityType,
        query.entityId,
        query.action,
        query.performedById,
        query.fromDate ? new Date(query.fromDate) : undefined,
        query.toDate ? new Date(query.toDate) : undefined,
        query.page,
        query.limit,
      ),
    );

    return {
      items: result.items.map((log) => ({
        id: log.id,
        entityType: log.entityType,
        entityId: log.entityId,
        action: log.action,
        changes: log.changes,
        performedById: log.performedById,
        performedByEmail: log.performedByEmail,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        requestId: log.requestId,
        createdAt: log.createdAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
