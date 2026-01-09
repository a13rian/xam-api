import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUuidToVarchar1767959833791 implements MigrationInterface {
  name = 'FixUuidToVarchar1767959833791';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "last_login_at" TIMESTAMP WITH TIME ZONE
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "street" text
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "ward" character varying(100)
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "district" character varying(100)
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "city" character varying(100)
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "latitude" numeric(10, 7)
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "longitude" numeric(10, 7)
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations" DROP COLUMN "approved_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations"
            ADD "approved_by" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "organization_locations" DROP CONSTRAINT "fk_organization_locations_organization_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_organization_locations_organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "organization_locations" DROP COLUMN "organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "organization_locations"
            ADD "organization_id" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_roles_name_organization_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_roles_organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "roles" DROP COLUMN "organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "roles"
            ADD "organization_id" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP CONSTRAINT "fk_bookings_customer_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_customer_id_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_customer_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP COLUMN "customer_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD "customer_id" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP COLUMN "cancelled_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD "cancelled_by" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "email_verification_tokens" DROP CONSTRAINT "fk_email_verification_tokens_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_email_verification_tokens_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "email_verification_tokens" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "email_verification_tokens"
            ADD "user_id" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours" DROP CONSTRAINT "fk_operating_hours_location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours" DROP CONSTRAINT "uq_operating_hours_location_id_day_of_week"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_operating_hours_location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours" DROP COLUMN "location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours"
            ADD "location_id" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "fk_password_reset_tokens_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_password_reset_tokens_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "password_reset_tokens" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "password_reset_tokens"
            ADD "user_id" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens" DROP CONSTRAINT "fk_refresh_tokens_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_refresh_tokens_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens"
            ADD "user_id" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "service_categories" DROP CONSTRAINT "fk_service_categories_parent_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_service_categories_parent_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "service_categories" DROP COLUMN "parent_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "service_categories"
            ADD "parent_id" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "services" DROP CONSTRAINT "fk_services_organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "services" DROP CONSTRAINT "fk_services_category_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_services_organization_id_is_active"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_services_organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "services" DROP COLUMN "organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "services"
            ADD "organization_id" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_services_category_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "services" DROP COLUMN "category_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "services"
            ADD "category_id" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP CONSTRAINT "fk_accounts_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP CONSTRAINT "fk_accounts_organization_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_accounts_organization_id_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_accounts_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP CONSTRAINT "uq_accounts_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD "user_id" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD CONSTRAINT "uq_accounts_user_id" UNIQUE ("user_id")
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_accounts_organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP COLUMN "organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD "organization_id" character varying(255)
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_accounts_invitation_token"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP COLUMN "invitation_token"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD "invitation_token" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP COLUMN "approved_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD "approved_by" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services" DROP CONSTRAINT "fk_staff_services_staff_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services" DROP CONSTRAINT "fk_staff_services_service_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services" DROP CONSTRAINT "uq_staff_services_staff_id_service_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_staff_services_staff_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services" DROP COLUMN "staff_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services"
            ADD "staff_id" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_staff_services_service_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services" DROP COLUMN "service_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services"
            ADD "service_id" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots" DROP CONSTRAINT "fk_time_slots_location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots" DROP CONSTRAINT "fk_time_slots_booking_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_time_slots_location_id_date_status"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots" DROP CONSTRAINT "uq_time_slots_location_id_staff_id_date_start_time"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_time_slots_location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots" DROP COLUMN "location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots"
            ADD "location_id" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_time_slots_staff_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots" DROP COLUMN "staff_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots"
            ADD "staff_id" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots" DROP COLUMN "booking_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots"
            ADD "booking_id" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions" DROP CONSTRAINT "fk_wallet_transactions_wallet_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wallet_transactions_wallet_id_created_at"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wallet_transactions_wallet_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions" DROP COLUMN "wallet_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions"
            ADD "wallet_id" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wallet_transactions_reference_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions" DROP COLUMN "reference_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions"
            ADD "reference_id" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets" DROP CONSTRAINT "fk_wallets_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wallets_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets" DROP CONSTRAINT "uq_wallets_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets"
            ADD "user_id" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets"
            ADD CONSTRAINT "uq_wallets_user_id" UNIQUE ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_organization_locations_organization_id" ON "organization_locations" ("organization_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_roles_organization_id" ON "roles" ("organization_id")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_roles_name_organization_id" ON "roles" ("name", "organization_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_customer_id" ON "bookings" ("customer_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_customer_id_status" ON "bookings" ("customer_id", "status")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_email_verification_tokens_user_id" ON "email_verification_tokens" ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_operating_hours_location_id" ON "operating_hours" ("location_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_password_reset_tokens_user_id" ON "password_reset_tokens" ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_service_categories_parent_id" ON "service_categories" ("parent_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_services_organization_id" ON "services" ("organization_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_services_category_id" ON "services" ("category_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_services_organization_id_is_active" ON "services" ("organization_id", "is_active")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_accounts_user_id" ON "accounts" ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_accounts_organization_id" ON "accounts" ("organization_id")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_accounts_invitation_token" ON "accounts" ("invitation_token")
            WHERE "invitation_token" IS NOT NULL
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_accounts_organization_id_user_id" ON "accounts" ("organization_id", "user_id")
            WHERE "organization_id" IS NOT NULL
                AND "user_id" IS NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_staff_services_staff_id" ON "staff_services" ("staff_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_staff_services_service_id" ON "staff_services" ("service_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_time_slots_location_id" ON "time_slots" ("location_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_time_slots_staff_id" ON "time_slots" ("staff_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_time_slots_location_id_date_status" ON "time_slots" ("location_id", "date", "status")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wallet_transactions_wallet_id" ON "wallet_transactions" ("wallet_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wallet_transactions_reference_id" ON "wallet_transactions" ("reference_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wallet_transactions_wallet_id_created_at" ON "wallet_transactions" ("wallet_id", "created_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wallets_user_id" ON "wallets" ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours"
            ADD CONSTRAINT "uq_operating_hours_location_id_day_of_week" UNIQUE ("location_id", "day_of_week")
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services"
            ADD CONSTRAINT "uq_staff_services_staff_id_service_id" UNIQUE ("staff_id", "service_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots"
            ADD CONSTRAINT "uq_time_slots_location_id_staff_id_date_start_time" UNIQUE ("location_id", "staff_id", "date", "start_time")
        `);
    await queryRunner.query(`
            ALTER TABLE "organization_locations"
            ADD CONSTRAINT "fk_organization_locations_organization_id" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD CONSTRAINT "fk_bookings_customer_id" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "email_verification_tokens"
            ADD CONSTRAINT "fk_email_verification_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours"
            ADD CONSTRAINT "fk_operating_hours_location_id" FOREIGN KEY ("location_id") REFERENCES "organization_locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "password_reset_tokens"
            ADD CONSTRAINT "fk_password_reset_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens"
            ADD CONSTRAINT "fk_refresh_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "service_categories"
            ADD CONSTRAINT "fk_service_categories_parent_id" FOREIGN KEY ("parent_id") REFERENCES "service_categories"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "services"
            ADD CONSTRAINT "fk_services_organization_id" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "services"
            ADD CONSTRAINT "fk_services_category_id" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD CONSTRAINT "fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD CONSTRAINT "fk_accounts_organization_id" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services"
            ADD CONSTRAINT "fk_staff_services_staff_id" FOREIGN KEY ("staff_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services"
            ADD CONSTRAINT "fk_staff_services_service_id" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots"
            ADD CONSTRAINT "fk_time_slots_booking_id" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots"
            ADD CONSTRAINT "fk_time_slots_location_id" FOREIGN KEY ("location_id") REFERENCES "organization_locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions"
            ADD CONSTRAINT "fk_wallet_transactions_wallet_id" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets"
            ADD CONSTRAINT "fk_wallets_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "wallets" DROP CONSTRAINT "fk_wallets_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions" DROP CONSTRAINT "fk_wallet_transactions_wallet_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots" DROP CONSTRAINT "fk_time_slots_location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots" DROP CONSTRAINT "fk_time_slots_booking_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services" DROP CONSTRAINT "fk_staff_services_service_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services" DROP CONSTRAINT "fk_staff_services_staff_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP CONSTRAINT "fk_accounts_organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP CONSTRAINT "fk_accounts_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "services" DROP CONSTRAINT "fk_services_category_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "services" DROP CONSTRAINT "fk_services_organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "service_categories" DROP CONSTRAINT "fk_service_categories_parent_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens" DROP CONSTRAINT "fk_refresh_tokens_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "fk_password_reset_tokens_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours" DROP CONSTRAINT "fk_operating_hours_location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "email_verification_tokens" DROP CONSTRAINT "fk_email_verification_tokens_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP CONSTRAINT "fk_bookings_customer_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "organization_locations" DROP CONSTRAINT "fk_organization_locations_organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots" DROP CONSTRAINT "uq_time_slots_location_id_staff_id_date_start_time"
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services" DROP CONSTRAINT "uq_staff_services_staff_id_service_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours" DROP CONSTRAINT "uq_operating_hours_location_id_day_of_week"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wallets_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wallet_transactions_wallet_id_created_at"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wallet_transactions_reference_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wallet_transactions_wallet_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_time_slots_location_id_date_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_time_slots_staff_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_time_slots_location_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_staff_services_service_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_staff_services_staff_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_accounts_organization_id_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_accounts_invitation_token"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_accounts_organization_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_accounts_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_services_organization_id_is_active"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_services_category_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_services_organization_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_service_categories_parent_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_refresh_tokens_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_password_reset_tokens_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_operating_hours_location_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_email_verification_tokens_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_customer_id_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_customer_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_roles_name_organization_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_roles_organization_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_organization_locations_organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets" DROP CONSTRAINT "uq_wallets_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets"
            ADD "user_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets"
            ADD CONSTRAINT "uq_wallets_user_id" UNIQUE ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wallets_user_id" ON "wallets" ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets"
            ADD CONSTRAINT "fk_wallets_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions" DROP COLUMN "reference_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions"
            ADD "reference_id" uuid
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wallet_transactions_reference_id" ON "wallet_transactions" ("reference_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions" DROP COLUMN "wallet_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions"
            ADD "wallet_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wallet_transactions_wallet_id" ON "wallet_transactions" ("wallet_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wallet_transactions_wallet_id_created_at" ON "wallet_transactions" ("created_at", "wallet_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions"
            ADD CONSTRAINT "fk_wallet_transactions_wallet_id" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots" DROP COLUMN "booking_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots"
            ADD "booking_id" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots" DROP COLUMN "staff_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots"
            ADD "staff_id" uuid
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_time_slots_staff_id" ON "time_slots" ("staff_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots" DROP COLUMN "location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots"
            ADD "location_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_time_slots_location_id" ON "time_slots" ("location_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots"
            ADD CONSTRAINT "uq_time_slots_location_id_staff_id_date_start_time" UNIQUE ("location_id", "staff_id", "date", "start_time")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_time_slots_location_id_date_status" ON "time_slots" ("location_id", "date", "status")
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots"
            ADD CONSTRAINT "fk_time_slots_booking_id" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots"
            ADD CONSTRAINT "fk_time_slots_location_id" FOREIGN KEY ("location_id") REFERENCES "organization_locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services" DROP COLUMN "service_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services"
            ADD "service_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_staff_services_service_id" ON "staff_services" ("service_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services" DROP COLUMN "staff_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services"
            ADD "staff_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_staff_services_staff_id" ON "staff_services" ("staff_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services"
            ADD CONSTRAINT "uq_staff_services_staff_id_service_id" UNIQUE ("staff_id", "service_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services"
            ADD CONSTRAINT "fk_staff_services_service_id" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services"
            ADD CONSTRAINT "fk_staff_services_staff_id" FOREIGN KEY ("staff_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP COLUMN "approved_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD "approved_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP COLUMN "invitation_token"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD "invitation_token" uuid
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_accounts_invitation_token" ON "accounts" ("invitation_token")
            WHERE (invitation_token IS NOT NULL)
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP COLUMN "organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD "organization_id" character varying
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_accounts_organization_id" ON "accounts" ("organization_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP CONSTRAINT "uq_accounts_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD "user_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD CONSTRAINT "uq_accounts_user_id" UNIQUE ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_accounts_user_id" ON "accounts" ("user_id")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_accounts_organization_id_user_id" ON "accounts" ("user_id", "organization_id")
            WHERE (
                    (organization_id IS NOT NULL)
                    AND (user_id IS NOT NULL)
                )
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD CONSTRAINT "fk_accounts_organization_id" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD CONSTRAINT "fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "services" DROP COLUMN "category_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "services"
            ADD "category_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_services_category_id" ON "services" ("category_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "services" DROP COLUMN "organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "services"
            ADD "organization_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_services_organization_id" ON "services" ("organization_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_services_organization_id_is_active" ON "services" ("organization_id", "is_active")
        `);
    await queryRunner.query(`
            ALTER TABLE "services"
            ADD CONSTRAINT "fk_services_category_id" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "services"
            ADD CONSTRAINT "fk_services_organization_id" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "service_categories" DROP COLUMN "parent_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "service_categories"
            ADD "parent_id" character varying
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_service_categories_parent_id" ON "service_categories" ("parent_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "service_categories"
            ADD CONSTRAINT "fk_service_categories_parent_id" FOREIGN KEY ("parent_id") REFERENCES "service_categories"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens"
            ADD "user_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens"
            ADD CONSTRAINT "fk_refresh_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "password_reset_tokens" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "password_reset_tokens"
            ADD "user_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_password_reset_tokens_user_id" ON "password_reset_tokens" ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "password_reset_tokens"
            ADD CONSTRAINT "fk_password_reset_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours" DROP COLUMN "location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours"
            ADD "location_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_operating_hours_location_id" ON "operating_hours" ("location_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours"
            ADD CONSTRAINT "uq_operating_hours_location_id_day_of_week" UNIQUE ("location_id", "day_of_week")
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours"
            ADD CONSTRAINT "fk_operating_hours_location_id" FOREIGN KEY ("location_id") REFERENCES "organization_locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "email_verification_tokens" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "email_verification_tokens"
            ADD "user_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_email_verification_tokens_user_id" ON "email_verification_tokens" ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "email_verification_tokens"
            ADD CONSTRAINT "fk_email_verification_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP COLUMN "cancelled_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD "cancelled_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP COLUMN "customer_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD "customer_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_customer_id" ON "bookings" ("customer_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_customer_id_status" ON "bookings" ("customer_id", "status")
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD CONSTRAINT "fk_bookings_customer_id" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "roles" DROP COLUMN "organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "roles"
            ADD "organization_id" uuid
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_roles_organization_id" ON "roles" ("organization_id")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_roles_name_organization_id" ON "roles" ("name", "organization_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "organization_locations" DROP COLUMN "organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "organization_locations"
            ADD "organization_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_organization_locations_organization_id" ON "organization_locations" ("organization_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "organization_locations"
            ADD CONSTRAINT "fk_organization_locations_organization_id" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations" DROP COLUMN "approved_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations"
            ADD "approved_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "longitude"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "latitude"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "city"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "district"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "ward"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "street"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "last_login_at"
        `);
  }
}
