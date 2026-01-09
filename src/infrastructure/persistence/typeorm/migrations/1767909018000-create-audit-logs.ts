import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogs1767909018000 implements MigrationInterface {
  name = 'CreateAuditLogs1767909018000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" varchar(255) NOT NULL,
        "entityType" varchar(50) NOT NULL,
        "entityId" varchar(255) NOT NULL,
        "action" varchar(50) NOT NULL,
        "changes" jsonb,
        "performedById" varchar(255) NOT NULL,
        "performedByEmail" varchar(255) NOT NULL,
        "ipAddress" varchar(50),
        "userAgent" text,
        "requestId" varchar(255),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_entity" ON "audit_logs" ("entityType", "entityId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_performed_by" ON "audit_logs" ("performedById")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_performed_by"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_entity"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
  }
}
