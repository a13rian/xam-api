import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditController } from '../http/controllers/audit.controller';
import { AuditLogOrmEntity } from '../../infrastructure/persistence/typeorm/entities';
import { AuditLogMapper } from '../../infrastructure/persistence/typeorm/mappers/audit-log.mapper';
import { AuditLogRepository } from '../../infrastructure/persistence/typeorm/repositories/audit-log.repository';
import { AUDIT_LOG_REPOSITORY } from '../../core/domain/audit/repositories/audit-log.repository.interface';
import { AuditService } from '../../core/application/audit/services/audit.service';
import {
  ListAuditLogsHandler,
  GetEntityAuditLogsHandler,
} from '../../core/application/audit/queries';

const QueryHandlers = [ListAuditLogsHandler, GetEntityAuditLogsHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([AuditLogOrmEntity])],
  controllers: [AuditController],
  providers: [
    AuditLogMapper,
    {
      provide: AUDIT_LOG_REPOSITORY,
      useClass: AuditLogRepository,
    },
    AuditService,
    ...QueryHandlers,
  ],
  exports: [AUDIT_LOG_REPOSITORY, AuditService],
})
export class AuditModule {}
