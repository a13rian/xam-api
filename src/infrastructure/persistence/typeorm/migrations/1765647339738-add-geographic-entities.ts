import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGeographicEntities1765647339738 implements MigrationInterface {
  name = 'AddGeographicEntities1765647339738';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "wards" ("id" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "code" character varying(10) NOT NULL, "name" character varying(255) NOT NULL, "nameEn" character varying(255), "slug" character varying(255) NOT NULL, "type" character varying(50) NOT NULL, "districtId" character varying(255) NOT NULL, "latitude" real, "longitude" real, "metadata" jsonb, "isActive" boolean NOT NULL DEFAULT true, "order" integer NOT NULL DEFAULT '0', "district_id" character varying(255), CONSTRAINT "UQ_24f16d2207b1dcb6ce07d81d20f" UNIQUE ("code"), CONSTRAINT "PK_f67afa72e02ac056570c0dde279" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_44376f2673cf48e54e1b51018f" ON "wards" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_812309cfc78b10b505a6cd44df" ON "wards" ("districtId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4bd89af76ca95fcea4c7866323" ON "wards" ("slug") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d31aafdd779b29f4d807a5742c" ON "wards" ("districtId", "code") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_24f16d2207b1dcb6ce07d81d20" ON "wards" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "districts" ("id" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "code" character varying(10) NOT NULL, "name" character varying(255) NOT NULL, "nameEn" character varying(255), "slug" character varying(255) NOT NULL, "type" character varying(50) NOT NULL, "provinceId" character varying(255) NOT NULL, "latitude" real, "longitude" real, "metadata" jsonb, "isActive" boolean NOT NULL DEFAULT true, "order" integer NOT NULL DEFAULT '0', "province_id" character varying(255), CONSTRAINT "UQ_8e9d73424149b43b38244f75528" UNIQUE ("code"), CONSTRAINT "PK_972a72ff4e3bea5c7f43a2b98af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b930715093f604059cf72b32b5" ON "districts" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5816de08e361ad9cab115bd6bf" ON "districts" ("provinceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d5f02510e946296ac6e4863784" ON "districts" ("slug") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_16283b18580afc5effec758e69" ON "districts" ("provinceId", "code") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8e9d73424149b43b38244f7552" ON "districts" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "provinces" ("id" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "code" character varying(10) NOT NULL, "name" character varying(255) NOT NULL, "nameEn" character varying(255), "slug" character varying(255) NOT NULL, "type" character varying(50) NOT NULL, "latitude" real, "longitude" real, "metadata" jsonb, "isActive" boolean NOT NULL DEFAULT true, "order" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_f4b684af62d5cb3aa174f6b9b8a" UNIQUE ("code"), CONSTRAINT "UQ_d9bd798de5f037f71e348d47f8d" UNIQUE ("slug"), CONSTRAINT "PK_2e4260eedbcad036ec53222e0c7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_50de0f29f3fa49afb02fa6212e" ON "provinces" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d9bd798de5f037f71e348d47f8" ON "provinces" ("slug") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f4b684af62d5cb3aa174f6b9b8" ON "provinces" ("code") `,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" DROP CONSTRAINT "FK_efb3b71d563f232af27211511af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_a7fbe16c4191734fb3d36ff531b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_e8e52dffc3bcbf5d3a90364c7c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_02663e39fff0b001faf6dd6df56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9"`,
    );
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_b8cdcf29b7dea8578f7daf2e686"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" DROP CONSTRAINT "FK_7b42aad446b6a3bf051c4111597"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" DROP CONSTRAINT "FK_aec1b1e2f00d8fc0eeb4889a8de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" DROP CONSTRAINT "PK_1067a088e0cb83a06b57ce3e504"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" ADD CONSTRAINT "PK_1067a088e0cb83a06b57ce3e504" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_efb3b71d563f232af27211511a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" DROP COLUMN "organizationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" ADD "organizationId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "PK_920331560282b8bd21bb02290df"`,
    );
    await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_86033897c009fcca8b6505d6be2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" DROP CONSTRAINT "PK_c1433d71a4838793a49dcad46ab"`,
    );
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_67b9cd20f987fc6dc70f7cd283f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" DROP CONSTRAINT "FK_10f285d038feb767bf7c2da14b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_d6a19d4b4f6c62dcd29daa497e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_8481388d6325e752cd4d7e26c6d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" DROP CONSTRAINT "FK_9a9d697fbd86c5285ed1662c7c7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" DROP CONSTRAINT "FK_4d1ac68d000975f0fd8fa7046e9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_383b9e492828e1e6ae76964565"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_81b0cecbec954d1e60cdc298df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "PK_bee6805982cc1e248e94ce94957"`,
    );
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_67b9cd20f987fc6dc70f7cd283"`,
    );
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "customerId"`);
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "customerId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a7fbe16c4191734fb3d36ff531"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN "organizationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "organizationId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b8cdcf29b7dea8578f7daf2e68"`,
    );
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "locationId"`);
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "locationId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" DROP CONSTRAINT "PK_8997bf4d0728c8740c87694d59a"`,
    );
    await queryRunner.query(`ALTER TABLE "booking_services" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "booking_services" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" ADD CONSTRAINT "PK_8997bf4d0728c8740c87694d59a" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9a9d697fbd86c5285ed1662c7c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" DROP COLUMN "bookingId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" ADD "bookingId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" DROP CONSTRAINT "PK_417a095bbed21c2369a6a01ab9a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "PK_417a095bbed21c2369a6a01ab9a" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_10f285d038feb767bf7c2da14b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" DROP COLUMN "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" ADD "userId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" DROP CONSTRAINT "UQ_46b4f5754a9413b8a0418b55b73"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" DROP CONSTRAINT "PK_2ada48e2269e8c902ec3f00439e"`,
    );
    await queryRunner.query(`ALTER TABLE "operating_hours" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD CONSTRAINT "PK_2ada48e2269e8c902ec3f00439e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7b42aad446b6a3bf051c411159"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" DROP COLUMN "locationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD "locationId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d6a19d4b4f6c62dcd29daa497e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP COLUMN "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD "userId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "PK_7d8bee0204106019488c4c50ffa"`,
    );
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_610102b60fea1455310ccd299d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "userId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" DROP CONSTRAINT "FK_b91ff0fd7c961a3b296882e2a20"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_034b52310c2d211bc979c3cc4e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" DROP CONSTRAINT "PK_fe4da5476c4ffe5aa2d3524ae68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" ADD CONSTRAINT "PK_fe4da5476c4ffe5aa2d3524ae68" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b91ff0fd7c961a3b296882e2a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" DROP COLUMN "parentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" ADD "parentId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP CONSTRAINT "FK_1c3f741478b75745b885c329b9c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4bfcbad5c2463c4b7258f02a6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2"`,
    );
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "services" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "services" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "services" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e8e52dffc3bcbf5d3a90364c7c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "organizationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD "organizationId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_034b52310c2d211bc979c3cc4e"`,
    );
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "categoryId"`);
    await queryRunner.query(
      `ALTER TABLE "services" ADD "categoryId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP CONSTRAINT "FK_536fadedfbced7381aa451a6cba"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_df2f26222365cc6e2feeb28f52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "PK_5a7a02c20412299d198e097a8fe"`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3aa23c0a6d107393e8b40e3e2a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "UQ_3aa23c0a6d107393e8b40e3e2a6"`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "userId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "UQ_3aa23c0a6d107393e8b40e3e2a6" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_02663e39fff0b001faf6dd6df5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "organizationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "organizationId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP CONSTRAINT "UQ_0486423a17929cf5a2c0b7f4b14"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP CONSTRAINT "PK_960130c8a280d6ae93ec9d04d12"`,
    );
    await queryRunner.query(`ALTER TABLE "staff_services" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD CONSTRAINT "PK_960130c8a280d6ae93ec9d04d12" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_536fadedfbced7381aa451a6cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP COLUMN "staffId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD "staffId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1c3f741478b75745b885c329b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP COLUMN "serviceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD "serviceId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_16a486048b6d3a4c0a61dd3428"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" DROP CONSTRAINT "UQ_6dfa0029720370ad577b04b1b3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" DROP CONSTRAINT "PK_f87c73d8648c3f3f297adba3cb8"`,
    );
    await queryRunner.query(`ALTER TABLE "time_slots" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD CONSTRAINT "PK_f87c73d8648c3f3f297adba3cb8" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "time_slots" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "time_slots" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aec1b1e2f00d8fc0eeb4889a8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" DROP COLUMN "locationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD "locationId" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "time_slots" DROP COLUMN "bookingId"`);
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD "bookingId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "PK_8481388d6325e752cd4d7e26c6d"`,
    );
    await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD "userId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "PK_8481388d6325e752cd4d7e26c6d" PRIMARY KEY ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5f90b0972a69334dfc7ff9c8ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "PK_5120f131bde2cda940ec1a621db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "PK_5120f131bde2cda940ec1a621db" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8a94d9d61a2b05123710b325fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP COLUMN "walletId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD "walletId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e"`,
    );
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2ecdb33f23e9a6fc392025c0b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "UQ_2ecdb33f23e9a6fc392025c0b97"`,
    );
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "userId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "UQ_2ecdb33f23e9a6fc392025c0b97" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_06792d0c62ce6b0203c03643cdd" PRIMARY KEY ("permissionId")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b4599f8b8f548d35850afa2d12"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP COLUMN "roleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD "roleId" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_06792d0c62ce6b0203c03643cdd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03" PRIMARY KEY ("permissionId", "roleId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_b4599f8b8f548d35850afa2d12c" PRIMARY KEY ("roleId")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_06792d0c62ce6b0203c03643cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP COLUMN "permissionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD "permissionId" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_b4599f8b8f548d35850afa2d12c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03" PRIMARY KEY ("roleId", "permissionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "PK_86033897c009fcca8b6505d6be2" PRIMARY KEY ("roleId")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_472b25323af01488f1f66a06b6"`,
    );
    await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD "userId" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "PK_86033897c009fcca8b6505d6be2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475" PRIMARY KEY ("roleId", "userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "PK_472b25323af01488f1f66a06b67" PRIMARY KEY ("userId")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_86033897c009fcca8b6505d6be"`,
    );
    await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "roleId"`);
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD "roleId" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "PK_472b25323af01488f1f66a06b67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475" PRIMARY KEY ("userId", "roleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_efb3b71d563f232af27211511a" ON "organization_locations" ("organizationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_67b9cd20f987fc6dc70f7cd283" ON "bookings" ("customerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a7fbe16c4191734fb3d36ff531" ON "bookings" ("organizationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8cdcf29b7dea8578f7daf2e68" ON "bookings" ("locationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_81b0cecbec954d1e60cdc298df" ON "bookings" ("organizationId", "scheduledDate") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_383b9e492828e1e6ae76964565" ON "bookings" ("customerId", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a9d697fbd86c5285ed1662c7c" ON "booking_services" ("bookingId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_10f285d038feb767bf7c2da14b" ON "email_verification_tokens" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7b42aad446b6a3bf051c411159" ON "operating_hours" ("locationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d6a19d4b4f6c62dcd29daa497e" ON "password_reset_tokens" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_610102b60fea1455310ccd299d" ON "refresh_tokens" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b91ff0fd7c961a3b296882e2a2" ON "service_categories" ("parentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e8e52dffc3bcbf5d3a90364c7c" ON "services" ("organizationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_034b52310c2d211bc979c3cc4e" ON "services" ("categoryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4bfcbad5c2463c4b7258f02a6c" ON "services" ("organizationId", "isActive") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3aa23c0a6d107393e8b40e3e2a" ON "accounts" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_02663e39fff0b001faf6dd6df5" ON "accounts" ("organizationId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_df2f26222365cc6e2feeb28f52" ON "accounts" ("organizationId", "userId") WHERE "organizationId" IS NOT NULL AND "userId" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_536fadedfbced7381aa451a6cb" ON "staff_services" ("staffId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1c3f741478b75745b885c329b9" ON "staff_services" ("serviceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aec1b1e2f00d8fc0eeb4889a8d" ON "time_slots" ("locationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_16a486048b6d3a4c0a61dd3428" ON "time_slots" ("locationId", "date", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8a94d9d61a2b05123710b325fb" ON "wallet_transactions" ("walletId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f90b0972a69334dfc7ff9c8ea" ON "wallet_transactions" ("walletId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2ecdb33f23e9a6fc392025c0b9" ON "wallets" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b4599f8b8f548d35850afa2d12" ON "role_permissions" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_06792d0c62ce6b0203c03643cd" ON "role_permissions" ("permissionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_472b25323af01488f1f66a06b6" ON "user_roles" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_86033897c009fcca8b6505d6be" ON "user_roles" ("roleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD CONSTRAINT "UQ_46b4f5754a9413b8a0418b55b73" UNIQUE ("locationId", "dayOfWeek")`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD CONSTRAINT "UQ_0486423a17929cf5a2c0b7f4b14" UNIQUE ("staffId", "serviceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD CONSTRAINT "UQ_6dfa0029720370ad577b04b1b3d" UNIQUE ("locationId", "staffId", "date", "startTime")`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" ADD CONSTRAINT "FK_efb3b71d563f232af27211511af" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_67b9cd20f987fc6dc70f7cd283f" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_a7fbe16c4191734fb3d36ff531b" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_b8cdcf29b7dea8578f7daf2e686" FOREIGN KEY ("locationId") REFERENCES "organization_locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" ADD CONSTRAINT "FK_9a9d697fbd86c5285ed1662c7c7" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "FK_10f285d038feb767bf7c2da14b3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD CONSTRAINT "FK_7b42aad446b6a3bf051c4111597" FOREIGN KEY ("locationId") REFERENCES "organization_locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "FK_d6a19d4b4f6c62dcd29daa497e2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" ADD CONSTRAINT "FK_b91ff0fd7c961a3b296882e2a20" FOREIGN KEY ("parentId") REFERENCES "service_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_e8e52dffc3bcbf5d3a90364c7c5" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_034b52310c2d211bc979c3cc4e8" FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_02663e39fff0b001faf6dd6df56" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD CONSTRAINT "FK_536fadedfbced7381aa451a6cba" FOREIGN KEY ("staffId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD CONSTRAINT "FK_1c3f741478b75745b885c329b9c" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD CONSTRAINT "FK_4d1ac68d000975f0fd8fa7046e9" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD CONSTRAINT "FK_aec1b1e2f00d8fc0eeb4889a8de" FOREIGN KEY ("locationId") REFERENCES "organization_locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_8481388d6325e752cd4d7e26c6d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wards" ADD CONSTRAINT "FK_3d1ef92876a28d10ac2d3fe766b" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "districts" ADD CONSTRAINT "FK_9d451638507b11822dc411a2dfe" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_86033897c009fcca8b6505d6be2" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_86033897c009fcca8b6505d6be2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "districts" DROP CONSTRAINT "FK_9d451638507b11822dc411a2dfe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wards" DROP CONSTRAINT "FK_3d1ef92876a28d10ac2d3fe766b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_8481388d6325e752cd4d7e26c6d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" DROP CONSTRAINT "FK_aec1b1e2f00d8fc0eeb4889a8de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" DROP CONSTRAINT "FK_4d1ac68d000975f0fd8fa7046e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP CONSTRAINT "FK_1c3f741478b75745b885c329b9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP CONSTRAINT "FK_536fadedfbced7381aa451a6cba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_02663e39fff0b001faf6dd6df56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_034b52310c2d211bc979c3cc4e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_e8e52dffc3bcbf5d3a90364c7c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" DROP CONSTRAINT "FK_b91ff0fd7c961a3b296882e2a20"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_d6a19d4b4f6c62dcd29daa497e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" DROP CONSTRAINT "FK_7b42aad446b6a3bf051c4111597"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" DROP CONSTRAINT "FK_10f285d038feb767bf7c2da14b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" DROP CONSTRAINT "FK_9a9d697fbd86c5285ed1662c7c7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_b8cdcf29b7dea8578f7daf2e686"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_a7fbe16c4191734fb3d36ff531b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_67b9cd20f987fc6dc70f7cd283f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" DROP CONSTRAINT "FK_efb3b71d563f232af27211511af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" DROP CONSTRAINT "UQ_6dfa0029720370ad577b04b1b3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP CONSTRAINT "UQ_0486423a17929cf5a2c0b7f4b14"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" DROP CONSTRAINT "UQ_46b4f5754a9413b8a0418b55b73"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_86033897c009fcca8b6505d6be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_472b25323af01488f1f66a06b6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_06792d0c62ce6b0203c03643cd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b4599f8b8f548d35850afa2d12"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2ecdb33f23e9a6fc392025c0b9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5f90b0972a69334dfc7ff9c8ea"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8a94d9d61a2b05123710b325fb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_16a486048b6d3a4c0a61dd3428"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aec1b1e2f00d8fc0eeb4889a8d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1c3f741478b75745b885c329b9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_536fadedfbced7381aa451a6cb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_df2f26222365cc6e2feeb28f52"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_02663e39fff0b001faf6dd6df5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3aa23c0a6d107393e8b40e3e2a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4bfcbad5c2463c4b7258f02a6c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_034b52310c2d211bc979c3cc4e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e8e52dffc3bcbf5d3a90364c7c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b91ff0fd7c961a3b296882e2a2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_610102b60fea1455310ccd299d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d6a19d4b4f6c62dcd29daa497e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7b42aad446b6a3bf051c411159"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_10f285d038feb767bf7c2da14b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9a9d697fbd86c5285ed1662c7c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_383b9e492828e1e6ae76964565"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_81b0cecbec954d1e60cdc298df"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b8cdcf29b7dea8578f7daf2e68"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a7fbe16c4191734fb3d36ff531"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_67b9cd20f987fc6dc70f7cd283"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_efb3b71d563f232af27211511a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "PK_472b25323af01488f1f66a06b67" PRIMARY KEY ("userId")`,
    );
    await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "roleId"`);
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD "roleId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_86033897c009fcca8b6505d6be" ON "user_roles" ("roleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "PK_472b25323af01488f1f66a06b67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475" PRIMARY KEY ("roleId", "userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "PK_86033897c009fcca8b6505d6be2" PRIMARY KEY ("roleId")`,
    );
    await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_472b25323af01488f1f66a06b6" ON "user_roles" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "PK_86033897c009fcca8b6505d6be2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475" PRIMARY KEY ("userId", "roleId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_b4599f8b8f548d35850afa2d12c" PRIMARY KEY ("roleId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP COLUMN "permissionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD "permissionId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_06792d0c62ce6b0203c03643cd" ON "role_permissions" ("permissionId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_b4599f8b8f548d35850afa2d12c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03" PRIMARY KEY ("permissionId", "roleId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_06792d0c62ce6b0203c03643cdd" PRIMARY KEY ("permissionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP COLUMN "roleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD "roleId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b4599f8b8f548d35850afa2d12" ON "role_permissions" ("roleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_06792d0c62ce6b0203c03643cdd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03" PRIMARY KEY ("roleId", "permissionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "UQ_2ecdb33f23e9a6fc392025c0b97"`,
    );
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "wallets" ADD "userId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "UQ_2ecdb33f23e9a6fc392025c0b97" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2ecdb33f23e9a6fc392025c0b9" ON "wallets" ("userId") `,
    );
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e"`,
    );
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "wallets" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP COLUMN "walletId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD "walletId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8a94d9d61a2b05123710b325fb" ON "wallet_transactions" ("walletId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "PK_5120f131bde2cda940ec1a621db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD "id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "PK_5120f131bde2cda940ec1a621db" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f90b0972a69334dfc7ff9c8ea" ON "wallet_transactions" ("walletId", "createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "PK_8481388d6325e752cd4d7e26c6d"`,
    );
    await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "PK_8481388d6325e752cd4d7e26c6d" PRIMARY KEY ("userId")`,
    );
    await queryRunner.query(`ALTER TABLE "time_slots" DROP COLUMN "bookingId"`);
    await queryRunner.query(`ALTER TABLE "time_slots" ADD "bookingId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "time_slots" DROP COLUMN "locationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD "locationId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aec1b1e2f00d8fc0eeb4889a8d" ON "time_slots" ("locationId") `,
    );
    await queryRunner.query(`ALTER TABLE "time_slots" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "time_slots" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" DROP CONSTRAINT "PK_f87c73d8648c3f3f297adba3cb8"`,
    );
    await queryRunner.query(`ALTER TABLE "time_slots" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "time_slots" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD CONSTRAINT "PK_f87c73d8648c3f3f297adba3cb8" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD CONSTRAINT "UQ_6dfa0029720370ad577b04b1b3d" UNIQUE ("locationId", "staffId", "date", "startTime")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_16a486048b6d3a4c0a61dd3428" ON "time_slots" ("locationId", "date", "status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP COLUMN "serviceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD "serviceId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1c3f741478b75745b885c329b9" ON "staff_services" ("serviceId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP COLUMN "staffId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD "staffId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_536fadedfbced7381aa451a6cb" ON "staff_services" ("staffId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP CONSTRAINT "PK_960130c8a280d6ae93ec9d04d12"`,
    );
    await queryRunner.query(`ALTER TABLE "staff_services" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD "id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD CONSTRAINT "PK_960130c8a280d6ae93ec9d04d12" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD CONSTRAINT "UQ_0486423a17929cf5a2c0b7f4b14" UNIQUE ("staffId", "serviceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "organizationId"`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" ADD "organizationId" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_02663e39fff0b001faf6dd6df5" ON "accounts" ("organizationId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "UQ_3aa23c0a6d107393e8b40e3e2a6"`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "UQ_3aa23c0a6d107393e8b40e3e2a6" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3aa23c0a6d107393e8b40e3e2a" ON "accounts" ("userId") `,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "PK_5a7a02c20412299d198e097a8fe"`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "accounts" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_df2f26222365cc6e2feeb28f52" ON "accounts" ("userId", "organizationId") WHERE (("organizationId" IS NOT NULL) AND ("userId" IS NOT NULL))`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD CONSTRAINT "FK_536fadedfbced7381aa451a6cba" FOREIGN KEY ("staffId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "categoryId"`);
    await queryRunner.query(
      `ALTER TABLE "services" ADD "categoryId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_034b52310c2d211bc979c3cc4e" ON "services" ("categoryId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "organizationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD "organizationId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e8e52dffc3bcbf5d3a90364c7c" ON "services" ("organizationId") `,
    );
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "services" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "services" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2"`,
    );
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "services" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4bfcbad5c2463c4b7258f02a6c" ON "services" ("organizationId", "isActive") `,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" ADD CONSTRAINT "FK_1c3f741478b75745b885c329b9c" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" DROP COLUMN "parentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" ADD "parentId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b91ff0fd7c961a3b296882e2a2" ON "service_categories" ("parentId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" DROP CONSTRAINT "PK_fe4da5476c4ffe5aa2d3524ae68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" ADD "id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" ADD CONSTRAINT "PK_fe4da5476c4ffe5aa2d3524ae68" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_034b52310c2d211bc979c3cc4e8" FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" ADD CONSTRAINT "FK_b91ff0fd7c961a3b296882e2a20" FOREIGN KEY ("parentId") REFERENCES "service_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_610102b60fea1455310ccd299d" ON "refresh_tokens" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "PK_7d8bee0204106019488c4c50ffa"`,
    );
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP COLUMN "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d6a19d4b4f6c62dcd29daa497e" ON "password_reset_tokens" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD "id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" DROP COLUMN "locationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD "locationId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7b42aad446b6a3bf051c411159" ON "operating_hours" ("locationId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" DROP CONSTRAINT "PK_2ada48e2269e8c902ec3f00439e"`,
    );
    await queryRunner.query(`ALTER TABLE "operating_hours" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD "id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD CONSTRAINT "PK_2ada48e2269e8c902ec3f00439e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD CONSTRAINT "UQ_46b4f5754a9413b8a0418b55b73" UNIQUE ("locationId", "dayOfWeek")`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" DROP COLUMN "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_10f285d038feb767bf7c2da14b" ON "email_verification_tokens" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" DROP CONSTRAINT "PK_417a095bbed21c2369a6a01ab9a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" ADD "id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "PK_417a095bbed21c2369a6a01ab9a" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" DROP COLUMN "bookingId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" ADD "bookingId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a9d697fbd86c5285ed1662c7c" ON "booking_services" ("bookingId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" DROP CONSTRAINT "PK_8997bf4d0728c8740c87694d59a"`,
    );
    await queryRunner.query(`ALTER TABLE "booking_services" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "booking_services" ADD "id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" ADD CONSTRAINT "PK_8997bf4d0728c8740c87694d59a" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "locationId"`);
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "locationId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8cdcf29b7dea8578f7daf2e68" ON "bookings" ("locationId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN "organizationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "organizationId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a7fbe16c4191734fb3d36ff531" ON "bookings" ("organizationId") `,
    );
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "customerId"`);
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "customerId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_67b9cd20f987fc6dc70f7cd283" ON "bookings" ("customerId") `,
    );
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "PK_bee6805982cc1e248e94ce94957"`,
    );
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "bookings" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_81b0cecbec954d1e60cdc298df" ON "bookings" ("organizationId", "scheduledDate") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_383b9e492828e1e6ae76964565" ON "bookings" ("customerId", "status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD CONSTRAINT "FK_4d1ac68d000975f0fd8fa7046e9" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" ADD CONSTRAINT "FK_9a9d697fbd86c5285ed1662c7c7" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_8481388d6325e752cd4d7e26c6d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "FK_d6a19d4b4f6c62dcd29daa497e2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "FK_10f285d038feb767bf7c2da14b3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_67b9cd20f987fc6dc70f7cd283f" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" DROP CONSTRAINT "PK_c1433d71a4838793a49dcad46ab"`,
    );
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "roles" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_86033897c009fcca8b6505d6be2" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "PK_920331560282b8bd21bb02290df"`,
    );
    await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "permissions" ADD "id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" DROP COLUMN "organizationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" ADD "organizationId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_efb3b71d563f232af27211511a" ON "organization_locations" ("organizationId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" DROP CONSTRAINT "PK_1067a088e0cb83a06b57ce3e504"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" ADD "id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" ADD CONSTRAINT "PK_1067a088e0cb83a06b57ce3e504" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD CONSTRAINT "FK_aec1b1e2f00d8fc0eeb4889a8de" FOREIGN KEY ("locationId") REFERENCES "organization_locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD CONSTRAINT "FK_7b42aad446b6a3bf051c4111597" FOREIGN KEY ("locationId") REFERENCES "organization_locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_b8cdcf29b7dea8578f7daf2e686" FOREIGN KEY ("locationId") REFERENCES "organization_locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9"`,
    );
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD "id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_02663e39fff0b001faf6dd6df56" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_e8e52dffc3bcbf5d3a90364c7c5" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_a7fbe16c4191734fb3d36ff531b" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" ADD CONSTRAINT "FK_efb3b71d563f232af27211511af" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(`ALTER TABLE "time_slots" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_services" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `ALTER TABLE "service_categories" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_locations" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f4b684af62d5cb3aa174f6b9b8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d9bd798de5f037f71e348d47f8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_50de0f29f3fa49afb02fa6212e"`,
    );
    await queryRunner.query(`DROP TABLE "provinces"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8e9d73424149b43b38244f7552"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_16283b18580afc5effec758e69"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d5f02510e946296ac6e4863784"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5816de08e361ad9cab115bd6bf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b930715093f604059cf72b32b5"`,
    );
    await queryRunner.query(`DROP TABLE "districts"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_24f16d2207b1dcb6ce07d81d20"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d31aafdd779b29f4d807a5742c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4bd89af76ca95fcea4c7866323"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_812309cfc78b10b505a6cd44df"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_44376f2673cf48e54e1b51018f"`,
    );
    await queryRunner.query(`DROP TABLE "wards"`);
  }
}
