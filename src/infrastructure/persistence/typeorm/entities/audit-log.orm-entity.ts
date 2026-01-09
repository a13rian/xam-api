import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { createId } from '@paralleldrive/cuid2';
import {
  AuditAction,
  EntityType,
  AuditChanges,
} from '../../../../core/domain/audit/entities/audit-log.entity';

@Entity('audit_logs')
@Index(['entityType', 'entityId'])
@Index(['performedById'])
@Index(['createdAt'])
export class AuditLogOrmEntity {
  @PrimaryColumn('varchar', { length: 255 })
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = `aud_${createId()}`;
    }
  }

  @Column({ type: 'varchar', length: 50 })
  entityType: EntityType;

  @Column({ type: 'varchar', length: 255 })
  entityId: string;

  @Column({ type: 'varchar', length: 50 })
  action: AuditAction;

  @Column({ type: 'jsonb', nullable: true })
  changes: AuditChanges | null;

  @Column({ type: 'varchar', length: 255 })
  performedById: string;

  @Column({ type: 'varchar', length: 255 })
  performedByEmail: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  requestId: string | null;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
