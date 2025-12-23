import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766482928247 implements MigrationInterface {
  name = 'Migration1766482928247';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD "account_id" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "booking_services"
            ADD "account_service_id" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP CONSTRAINT "fk_bookings_organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP CONSTRAINT "fk_bookings_location_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_organization_id_scheduled_date"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP COLUMN "organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD "organization_id" character varying(255)
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP COLUMN "location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD "location_id" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP COLUMN "staff_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD "staff_id" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "booking_services" DROP CONSTRAINT "fk_booking_services_booking_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_booking_services_booking_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "booking_services" DROP COLUMN "booking_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "booking_services"
            ADD "booking_id" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "booking_services" DROP COLUMN "service_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "booking_services"
            ADD "service_id" character varying(255)
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_organization_id" ON "bookings" ("organization_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_account_id" ON "bookings" ("account_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_location_id" ON "bookings" ("location_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_organization_id_scheduled_date" ON "bookings" ("organization_id", "scheduled_date")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_booking_services_booking_id" ON "booking_services" ("booking_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD CONSTRAINT "fk_bookings_organization_id" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD CONSTRAINT "fk_bookings_location_id" FOREIGN KEY ("location_id") REFERENCES "organization_locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "booking_services"
            ADD CONSTRAINT "fk_booking_services_booking_id" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "booking_services" DROP CONSTRAINT "fk_booking_services_booking_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP CONSTRAINT "fk_bookings_location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP CONSTRAINT "fk_bookings_organization_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_booking_services_booking_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_organization_id_scheduled_date"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_location_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_account_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "booking_services" DROP COLUMN "service_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "booking_services"
            ADD "service_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "booking_services" DROP COLUMN "booking_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "booking_services"
            ADD "booking_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_booking_services_booking_id" ON "booking_services" ("booking_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "booking_services"
            ADD CONSTRAINT "fk_booking_services_booking_id" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP COLUMN "staff_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD "staff_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP COLUMN "location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD "location_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_location_id" ON "bookings" ("location_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP COLUMN "organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD "organization_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_organization_id" ON "bookings" ("organization_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_organization_id_scheduled_date" ON "bookings" ("organization_id", "scheduled_date")
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD CONSTRAINT "fk_bookings_location_id" FOREIGN KEY ("location_id") REFERENCES "organization_locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD CONSTRAINT "fk_bookings_organization_id" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "booking_services" DROP COLUMN "account_service_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP COLUMN "account_id"
        `);
  }
}
