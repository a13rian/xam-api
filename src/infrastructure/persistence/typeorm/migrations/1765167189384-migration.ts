import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765167189384 implements MigrationInterface {
  name = 'Migration1765167189384';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."wallet_transactions_type_enum" AS ENUM(
                'deposit',
                'withdrawal',
                'payment',
                'refund',
                'adjustment'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "wallet_transactions" (
                "id" uuid NOT NULL,
                "walletId" uuid NOT NULL,
                "type" "public"."wallet_transactions_type_enum" NOT NULL,
                "amount" numeric(15, 2) NOT NULL,
                "balanceAfter" numeric(15, 2) NOT NULL,
                "currency" character varying(3) NOT NULL DEFAULT 'VND',
                "referenceType" character varying(50),
                "referenceId" uuid,
                "description" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_5120f131bde2cda940ec1a621db" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_8a94d9d61a2b05123710b325fb" ON "wallet_transactions" ("walletId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_0271c3a796744e2e618f99c263" ON "wallet_transactions" ("referenceType")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_5cda9aeb8e1321378789f85c79" ON "wallet_transactions" ("referenceId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_5f90b0972a69334dfc7ff9c8ea" ON "wallet_transactions" ("walletId", "createdAt")
        `);
    await queryRunner.query(`
            CREATE TABLE "wallets" (
                "id" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "balance" numeric(15, 2) NOT NULL DEFAULT '0',
                "currency" character varying(3) NOT NULL DEFAULT 'VND',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_2ecdb33f23e9a6fc392025c0b97" UNIQUE ("userId"),
                CONSTRAINT "REL_2ecdb33f23e9a6fc392025c0b9" UNIQUE ("userId"),
                CONSTRAINT "CHK_1c1bf32c2aa1b0f104543f3d6a" CHECK ("balance" >= 0),
                CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_2ecdb33f23e9a6fc392025c0b9" ON "wallets" ("userId")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."partner_documents_type_enum" AS ENUM(
                'business_license',
                'id_card',
                'tax_certificate',
                'other'
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."partner_documents_status_enum" AS ENUM('pending', 'approved', 'rejected')
        `);
    await queryRunner.query(`
            CREATE TABLE "partner_documents" (
                "id" uuid NOT NULL,
                "partnerId" uuid NOT NULL,
                "type" "public"."partner_documents_type_enum" NOT NULL,
                "url" text NOT NULL,
                "status" "public"."partner_documents_status_enum" NOT NULL DEFAULT 'pending',
                "rejectionReason" text,
                "reviewedAt" TIMESTAMP,
                "reviewedBy" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_e66d0f3f5d88856d18749f8b77f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_feed69b0339f73a6e5919c0ac6" ON "partner_documents" ("partnerId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b04365f74df318ec30fc119fb9" ON "partner_documents" ("status")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."partners_type_enum" AS ENUM('freelance', 'organization')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."partners_status_enum" AS ENUM('pending', 'active', 'suspended', 'rejected')
        `);
    await queryRunner.query(`
            CREATE TABLE "partners" (
                "id" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "type" "public"."partners_type_enum" NOT NULL,
                "status" "public"."partners_status_enum" NOT NULL,
                "businessName" character varying NOT NULL,
                "description" text,
                "rating" numeric(3, 2) NOT NULL DEFAULT '0',
                "reviewCount" integer NOT NULL DEFAULT '0',
                "isHomeServiceEnabled" boolean NOT NULL DEFAULT false,
                "homeServiceRadiusKm" numeric(5, 2),
                "rejectionReason" text,
                "approvedAt" TIMESTAMP,
                "approvedBy" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_153a88a7708ead965846a8e048b" UNIQUE ("userId"),
                CONSTRAINT "REL_153a88a7708ead965846a8e048" UNIQUE ("userId"),
                CONSTRAINT "PK_998645b20820e4ab99aeae03b41" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_153a88a7708ead965846a8e048" ON "partners" ("userId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_f3d75b59fec91a3228a799509e" ON "partners" ("type")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_25deaed1efbf09835c54f74d6c" ON "partners" ("status")
        `);
    await queryRunner.query(`
            CREATE TABLE "service_categories" (
                "id" uuid NOT NULL,
                "name" character varying(100) NOT NULL,
                "slug" character varying(150) NOT NULL,
                "description" text,
                "parentId" uuid,
                "iconUrl" text,
                "sortOrder" integer NOT NULL DEFAULT '0',
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_fe4da5476c4ffe5aa2d3524ae68" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_88a33271b3d94a0c4bc14db3b7" ON "service_categories" ("slug")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b91ff0fd7c961a3b296882e2a2" ON "service_categories" ("parentId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_cf2c09ef169ec4391b1c4051fd" ON "service_categories" ("isActive")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."services_bookingtype_enum" AS ENUM('time_slot', 'calendar')
        `);
    await queryRunner.query(`
            CREATE TABLE "services" (
                "id" uuid NOT NULL,
                "partnerId" uuid NOT NULL,
                "categoryId" uuid NOT NULL,
                "name" character varying(200) NOT NULL,
                "description" text,
                "priceAmount" numeric(15, 2) NOT NULL,
                "priceCurrency" character varying(3) NOT NULL DEFAULT 'VND',
                "durationMinutes" integer NOT NULL,
                "bookingType" "public"."services_bookingtype_enum" NOT NULL DEFAULT 'time_slot',
                "isActive" boolean NOT NULL DEFAULT true,
                "sortOrder" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_6e3ca1fc1577ff69a6e72582a5" ON "services" ("partnerId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_034b52310c2d211bc979c3cc4e" ON "services" ("categoryId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_ee000d957b389d7f240270f8f5" ON "services" ("partnerId", "isActive")
        `);
    await queryRunner.query(`
            CREATE TABLE "partner_locations" (
                "id" uuid NOT NULL,
                "partnerId" uuid NOT NULL,
                "name" character varying(200) NOT NULL,
                "street" text NOT NULL,
                "ward" character varying(100),
                "district" character varying(100) NOT NULL,
                "city" character varying(100) NOT NULL,
                "latitude" numeric(10, 7),
                "longitude" numeric(10, 7),
                "phone" character varying(20),
                "isPrimary" boolean NOT NULL DEFAULT false,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8edb96f8b19d86a4f51a30349de" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_36853d67e84f3860dc5ba70caf" ON "partner_locations" ("partnerId")
        `);
    await queryRunner.query(`
            CREATE TABLE "operating_hours" (
                "id" uuid NOT NULL,
                "locationId" uuid NOT NULL,
                "dayOfWeek" smallint NOT NULL,
                "openTime" TIME NOT NULL,
                "closeTime" TIME NOT NULL,
                "isClosed" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_46b4f5754a9413b8a0418b55b73" UNIQUE ("locationId", "dayOfWeek"),
                CONSTRAINT "PK_2ada48e2269e8c902ec3f00439e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_7b42aad446b6a3bf051c411159" ON "operating_hours" ("locationId")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."time_slots_status_enum" AS ENUM('available', 'booked', 'blocked')
        `);
    await queryRunner.query(`
            CREATE TABLE "time_slots" (
                "id" uuid NOT NULL,
                "locationId" uuid NOT NULL,
                "staffId" uuid,
                "date" date NOT NULL,
                "startTime" TIME NOT NULL,
                "endTime" TIME NOT NULL,
                "status" "public"."time_slots_status_enum" NOT NULL DEFAULT 'available',
                "bookingId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_6dfa0029720370ad577b04b1b3d" UNIQUE ("locationId", "staffId", "date", "startTime"),
                CONSTRAINT "PK_f87c73d8648c3f3f297adba3cb8" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_aec1b1e2f00d8fc0eeb4889a8d" ON "time_slots" ("locationId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_5a5478a160ac579cb9f32041f2" ON "time_slots" ("staffId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_17bced9e63a804a7cda932f9ba" ON "time_slots" ("date")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_16a486048b6d3a4c0a61dd3428" ON "time_slots" ("locationId", "date", "status")
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions"
            ADD CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets"
            ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "partner_documents"
            ADD CONSTRAINT "FK_feed69b0339f73a6e5919c0ac65" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "partners"
            ADD CONSTRAINT "FK_153a88a7708ead965846a8e048b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "service_categories"
            ADD CONSTRAINT "FK_b91ff0fd7c961a3b296882e2a20" FOREIGN KEY ("parentId") REFERENCES "service_categories"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "services"
            ADD CONSTRAINT "FK_6e3ca1fc1577ff69a6e72582a5b" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "services"
            ADD CONSTRAINT "FK_034b52310c2d211bc979c3cc4e8" FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "partner_locations"
            ADD CONSTRAINT "FK_36853d67e84f3860dc5ba70caf2" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours"
            ADD CONSTRAINT "FK_7b42aad446b6a3bf051c4111597" FOREIGN KEY ("locationId") REFERENCES "partner_locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots"
            ADD CONSTRAINT "FK_aec1b1e2f00d8fc0eeb4889a8de" FOREIGN KEY ("locationId") REFERENCES "partner_locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_slots" DROP CONSTRAINT "FK_aec1b1e2f00d8fc0eeb4889a8de"
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours" DROP CONSTRAINT "FK_7b42aad446b6a3bf051c4111597"
        `);
    await queryRunner.query(`
            ALTER TABLE "partner_locations" DROP CONSTRAINT "FK_36853d67e84f3860dc5ba70caf2"
        `);
    await queryRunner.query(`
            ALTER TABLE "services" DROP CONSTRAINT "FK_034b52310c2d211bc979c3cc4e8"
        `);
    await queryRunner.query(`
            ALTER TABLE "services" DROP CONSTRAINT "FK_6e3ca1fc1577ff69a6e72582a5b"
        `);
    await queryRunner.query(`
            ALTER TABLE "service_categories" DROP CONSTRAINT "FK_b91ff0fd7c961a3b296882e2a20"
        `);
    await queryRunner.query(`
            ALTER TABLE "partners" DROP CONSTRAINT "FK_153a88a7708ead965846a8e048b"
        `);
    await queryRunner.query(`
            ALTER TABLE "partner_documents" DROP CONSTRAINT "FK_feed69b0339f73a6e5919c0ac65"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_16a486048b6d3a4c0a61dd3428"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_17bced9e63a804a7cda932f9ba"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_5a5478a160ac579cb9f32041f2"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_aec1b1e2f00d8fc0eeb4889a8d"
        `);
    await queryRunner.query(`
            DROP TABLE "time_slots"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."time_slots_status_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_7b42aad446b6a3bf051c411159"
        `);
    await queryRunner.query(`
            DROP TABLE "operating_hours"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_36853d67e84f3860dc5ba70caf"
        `);
    await queryRunner.query(`
            DROP TABLE "partner_locations"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ee000d957b389d7f240270f8f5"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_034b52310c2d211bc979c3cc4e"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_6e3ca1fc1577ff69a6e72582a5"
        `);
    await queryRunner.query(`
            DROP TABLE "services"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."services_bookingtype_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_cf2c09ef169ec4391b1c4051fd"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b91ff0fd7c961a3b296882e2a2"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_88a33271b3d94a0c4bc14db3b7"
        `);
    await queryRunner.query(`
            DROP TABLE "service_categories"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_25deaed1efbf09835c54f74d6c"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_f3d75b59fec91a3228a799509e"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_153a88a7708ead965846a8e048"
        `);
    await queryRunner.query(`
            DROP TABLE "partners"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."partners_status_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."partners_type_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b04365f74df318ec30fc119fb9"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_feed69b0339f73a6e5919c0ac6"
        `);
    await queryRunner.query(`
            DROP TABLE "partner_documents"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."partner_documents_status_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."partner_documents_type_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_2ecdb33f23e9a6fc392025c0b9"
        `);
    await queryRunner.query(`
            DROP TABLE "wallets"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_5f90b0972a69334dfc7ff9c8ea"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_5cda9aeb8e1321378789f85c79"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_0271c3a796744e2e618f99c263"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_8a94d9d61a2b05123710b325fb"
        `);
    await queryRunner.query(`
            DROP TABLE "wallet_transactions"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."wallet_transactions_type_enum"
        `);
  }
}
