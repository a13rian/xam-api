import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  IAuditLogRepository,
  AUDIT_LOG_REPOSITORY,
} from '../../../domain/audit/repositories/audit-log.repository.interface';
import {
  AuditLog,
  AuditAction,
  EntityType,
  AuditChanges,
} from '../../../domain/audit/entities/audit-log.entity';

export interface AuditContext {
  performedById: string;
  performedByEmail: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async log(
    entityType: EntityType,
    entityId: string,
    action: AuditAction,
    context: AuditContext,
    changes?: AuditChanges,
  ): Promise<void> {
    try {
      const auditLog = AuditLog.create({
        entityType,
        entityId,
        action,
        changes,
        performedById: context.performedById,
        performedByEmail: context.performedByEmail,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        requestId: context.requestId,
      });

      await this.auditLogRepository.save(auditLog);

      this.logger.debug(
        `Audit log created: ${action} on ${entityType}:${entityId} by ${context.performedByEmail}`,
      );
    } catch (error) {
      // Log error but don't fail the main operation
      this.logger.error(
        `Failed to create audit log: ${action} on ${entityType}:${entityId}`,
        error,
      );
    }
  }

  async logCreate(
    entityType: EntityType,
    entityId: string,
    context: AuditContext,
    after?: Record<string, unknown>,
  ): Promise<void> {
    await this.log(entityType, entityId, AuditAction.CREATE, context, {
      after,
    });
  }

  async logUpdate(
    entityType: EntityType,
    entityId: string,
    context: AuditContext,
    before?: Record<string, unknown>,
    after?: Record<string, unknown>,
    changedFields?: string[],
  ): Promise<void> {
    await this.log(entityType, entityId, AuditAction.UPDATE, context, {
      before,
      after,
      changedFields,
    });
  }

  async logDelete(
    entityType: EntityType,
    entityId: string,
    context: AuditContext,
    before?: Record<string, unknown>,
  ): Promise<void> {
    await this.log(entityType, entityId, AuditAction.DELETE, context, {
      before,
    });
  }

  async logStatusChange(
    entityType: EntityType,
    entityId: string,
    context: AuditContext,
    before: boolean,
    after: boolean,
  ): Promise<void> {
    await this.log(entityType, entityId, AuditAction.STATUS_CHANGE, context, {
      before: { isActive: before },
      after: { isActive: after },
      changedFields: ['isActive'],
    });
  }

  async logPasswordReset(
    entityType: EntityType,
    entityId: string,
    context: AuditContext,
  ): Promise<void> {
    await this.log(entityType, entityId, AuditAction.PASSWORD_RESET, context);
  }
}
