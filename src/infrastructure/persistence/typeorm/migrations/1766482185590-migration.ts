import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766482185590 implements MigrationInterface {
  name = 'Migration1766482185590';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "account_services" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "account_id" character varying(255) NOT NULL,
                "category_id" character varying(255) NOT NULL,
                "name" character varying(200) NOT NULL,
                "description" text,
                "price_amount" numeric(15, 2) NOT NULL,
                "price_currency" character varying(3) NOT NULL DEFAULT 'VND',
                "duration_minutes" integer NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "sort_order" integer NOT NULL DEFAULT '0',
                CONSTRAINT "pk_account_services_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_account_services_account_id" ON "account_services" ("account_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_account_services_category_id" ON "account_services" ("category_id")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_account_services_account_id_name" ON "account_services" ("account_id", "name")
            WHERE "deleted_at" IS NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_account_services_account_id_is_active" ON "account_services" ("account_id", "is_active")
        `);
    await queryRunner.query(`
            ALTER TABLE "account_services"
            ADD CONSTRAINT "fk_account_services_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "account_services"
            ADD CONSTRAINT "fk_account_services_category_id" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "account_services" DROP CONSTRAINT "fk_account_services_category_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "account_services" DROP CONSTRAINT "fk_account_services_account_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_account_services_account_id_is_active"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_account_services_account_id_name"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_account_services_category_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_account_services_account_id"
        `);
    await queryRunner.query(`
            DROP TABLE "account_services"
        `);
  }
}
