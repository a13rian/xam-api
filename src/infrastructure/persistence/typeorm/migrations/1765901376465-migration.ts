import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765901376465 implements MigrationInterface {
  name = 'Migration1765901376465';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    await queryRunner.query(`
            CREATE TYPE "public"."organizations_status_enum" AS ENUM('pending', 'active', 'suspended', 'rejected')
        `);
    await queryRunner.query(`
            CREATE TABLE "organizations" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "status" "public"."organizations_status_enum" NOT NULL,
                "description" text,
                "rating" numeric(3, 2) NOT NULL DEFAULT '0',
                "review_count" integer NOT NULL DEFAULT '0',
                "is_home_service_enabled" boolean NOT NULL DEFAULT false,
                "home_service_radius_km" numeric(5, 2),
                "rejection_reason" text,
                "approved_at" TIMESTAMP,
                "approved_by" uuid,
                "business_name" character varying(200) NOT NULL,
                "tax_id" character varying(50),
                "business_license" character varying(100),
                "company_size" character varying(20),
                "website" character varying(255),
                "social_media" jsonb NOT NULL DEFAULT '{}',
                "established_date" date,
                CONSTRAINT "pk_organizations_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_organizations_status" ON "organizations" ("status")
        `);
    await queryRunner.query(`
            CREATE TABLE "organization_locations" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "organization_id" character varying NOT NULL,
                "name" character varying(200) NOT NULL,
                "street" text NOT NULL,
                "ward" character varying(100),
                "district" character varying(100) NOT NULL,
                "city" character varying(100) NOT NULL,
                "latitude" numeric(10, 7),
                "longitude" numeric(10, 7),
                "location" geography(Point, 4326),
                "phone" character varying(20),
                "is_primary" boolean NOT NULL DEFAULT false,
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "pk_organization_locations_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_organization_locations_organization_id" ON "organization_locations" ("organization_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_organization_locations_location" ON "organization_locations" USING GiST ("location")
        `);
    await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "code" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" text,
                "resource" character varying NOT NULL,
                "action" character varying NOT NULL,
                CONSTRAINT "uq_permissions_code" UNIQUE ("code"),
                CONSTRAINT "pk_permissions_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_permissions_code" ON "permissions" ("code")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_permissions_resource" ON "permissions" ("resource")
        `);
    await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "name" character varying NOT NULL,
                "description" text,
                "is_system" boolean NOT NULL DEFAULT false,
                "organization_id" uuid,
                CONSTRAINT "pk_roles_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_roles_organization_id" ON "roles" ("organization_id")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_roles_name_organization_id" ON "roles" ("name", "organization_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "email" character varying NOT NULL,
                "password_hash" character varying NOT NULL,
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "avatar_url" character varying(500),
                "phone" character varying(20),
                "date_of_birth" date,
                "gender" character varying(20),
                "is_active" boolean NOT NULL DEFAULT true,
                "email_verified_at" TIMESTAMP,
                "failed_login_attempts" integer NOT NULL DEFAULT '0',
                "locked_until" TIMESTAMP,
                CONSTRAINT "uq_users_email" UNIQUE ("email"),
                CONSTRAINT "pk_users_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_users_email" ON "users" ("email")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."bookings_status_enum" AS ENUM(
                'pending',
                'confirmed',
                'in_progress',
                'completed',
                'cancelled'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "bookings" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "customer_id" character varying NOT NULL,
                "organization_id" character varying NOT NULL,
                "location_id" character varying NOT NULL,
                "staff_id" uuid,
                "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'pending',
                "scheduled_date" date NOT NULL,
                "start_time" TIME NOT NULL,
                "end_time" TIME NOT NULL,
                "total_amount" numeric(15, 2) NOT NULL,
                "paid_amount" numeric(15, 2) NOT NULL DEFAULT '0',
                "currency" character varying(3) NOT NULL DEFAULT 'VND',
                "is_home_service" boolean NOT NULL DEFAULT false,
                "customer_address" text,
                "customer_phone" character varying(20) NOT NULL,
                "customer_name" character varying(200) NOT NULL,
                "notes" text,
                "cancellation_reason" text,
                "cancelled_by" uuid,
                "confirmed_at" TIMESTAMP,
                "started_at" TIMESTAMP,
                "completed_at" TIMESTAMP,
                "cancelled_at" TIMESTAMP,
                CONSTRAINT "pk_bookings_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_customer_id" ON "bookings" ("customer_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_organization_id" ON "bookings" ("organization_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_location_id" ON "bookings" ("location_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_scheduled_date" ON "bookings" ("scheduled_date")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_organization_id_scheduled_date" ON "bookings" ("organization_id", "scheduled_date")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_bookings_customer_id_status" ON "bookings" ("customer_id", "status")
        `);
    await queryRunner.query(`
            CREATE TABLE "booking_services" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "booking_id" character varying NOT NULL,
                "service_id" uuid NOT NULL,
                "service_name" character varying(200) NOT NULL,
                "price" numeric(15, 2) NOT NULL,
                "currency" character varying(3) NOT NULL DEFAULT 'VND',
                "duration_minutes" integer NOT NULL,
                CONSTRAINT "pk_booking_services_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_booking_services_booking_id" ON "booking_services" ("booking_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "email_verification_tokens" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "token" character varying NOT NULL,
                "user_id" character varying NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "is_used" boolean NOT NULL DEFAULT false,
                CONSTRAINT "pk_email_verification_tokens_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_email_verification_tokens_token" ON "email_verification_tokens" ("token")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_email_verification_tokens_user_id" ON "email_verification_tokens" ("user_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "operating_hours" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "location_id" character varying NOT NULL,
                "day_of_week" smallint NOT NULL,
                "open_time" TIME NOT NULL,
                "close_time" TIME NOT NULL,
                "is_closed" boolean NOT NULL DEFAULT false,
                CONSTRAINT "uq_operating_hours_location_id_day_of_week" UNIQUE ("location_id", "day_of_week"),
                CONSTRAINT "pk_operating_hours_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_operating_hours_location_id" ON "operating_hours" ("location_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "password_reset_tokens" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "token" character varying NOT NULL,
                "user_id" character varying NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "is_used" boolean NOT NULL DEFAULT false,
                CONSTRAINT "pk_password_reset_tokens_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_password_reset_tokens_token" ON "password_reset_tokens" ("token")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_password_reset_tokens_user_id" ON "password_reset_tokens" ("user_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "refresh_tokens" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "token" character varying NOT NULL,
                "user_id" character varying NOT NULL,
                "user_agent" character varying,
                "ip_address" character varying,
                "expires_at" TIMESTAMP NOT NULL,
                "is_revoked" boolean NOT NULL DEFAULT false,
                CONSTRAINT "pk_refresh_tokens_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_refresh_tokens_token" ON "refresh_tokens" ("token")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "service_categories" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "name" character varying(100) NOT NULL,
                "slug" character varying(150) NOT NULL,
                "description" text,
                "parent_id" character varying,
                "icon_url" text,
                "sort_order" integer NOT NULL DEFAULT '0',
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "pk_service_categories_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_service_categories_slug" ON "service_categories" ("slug")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_service_categories_parent_id" ON "service_categories" ("parent_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_service_categories_is_active" ON "service_categories" ("is_active")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."services_booking_type_enum" AS ENUM('time_slot', 'calendar', 'walk_in')
        `);
    await queryRunner.query(`
            CREATE TABLE "services" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "organization_id" character varying NOT NULL,
                "category_id" character varying NOT NULL,
                "name" character varying(200) NOT NULL,
                "description" text,
                "price_amount" numeric(15, 2) NOT NULL,
                "price_currency" character varying(3) NOT NULL DEFAULT 'VND',
                "duration_minutes" integer NOT NULL,
                "booking_type" "public"."services_booking_type_enum" NOT NULL DEFAULT 'time_slot',
                "is_active" boolean NOT NULL DEFAULT true,
                "sort_order" integer NOT NULL DEFAULT '0',
                CONSTRAINT "pk_services_id" PRIMARY KEY ("id")
            )
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
            CREATE TYPE "public"."accounts_type_enum" AS ENUM('individual', 'business')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."accounts_role_enum" AS ENUM('owner', 'manager', 'member')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."accounts_status_enum" AS ENUM('pending', 'active', 'suspended', 'rejected')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."accounts_invitation_status_enum" AS ENUM('pending', 'accepted', 'declined', 'expired')
        `);
    await queryRunner.query(`
            CREATE TABLE "accounts" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "user_id" character varying NOT NULL,
                "organization_id" character varying,
                "type" "public"."accounts_type_enum" NOT NULL,
                "role" "public"."accounts_role_enum",
                "display_name" character varying(200) NOT NULL,
                "specialization" character varying(100),
                "years_experience" smallint,
                "certifications" jsonb NOT NULL DEFAULT '[]',
                "portfolio" text,
                "personal_bio" text,
                "status" "public"."accounts_status_enum" NOT NULL,
                "invitation_status" "public"."accounts_invitation_status_enum",
                "invitation_token" uuid,
                "invited_at" TIMESTAMP,
                "accepted_at" TIMESTAMP,
                "is_active" boolean NOT NULL DEFAULT true,
                "approved_at" TIMESTAMP,
                "approved_by" uuid,
                "rejection_reason" text,
                "street" text,
                "ward" character varying(100),
                "district" character varying(100),
                "city" character varying(100),
                "latitude" numeric(10, 7),
                "longitude" numeric(10, 7),
                "location" geography(Point, 4326),
                "avatar_url" character varying(500),
                "cover_image_url" character varying(500),
                "video_intro_url" character varying(500),
                "phone" character varying(20),
                "business_email" character varying(255),
                "website" character varying(500),
                "social_links" jsonb,
                "tagline" character varying(100),
                "service_areas" jsonb NOT NULL DEFAULT '[]',
                "languages" jsonb NOT NULL DEFAULT '[]',
                "working_hours" jsonb,
                "price_range" jsonb,
                "is_verified" boolean NOT NULL DEFAULT false,
                "verified_at" TIMESTAMP,
                "badges" jsonb NOT NULL DEFAULT '[]',
                "rating" numeric(2, 1),
                "total_reviews" integer NOT NULL DEFAULT '0',
                "completed_bookings" integer NOT NULL DEFAULT '0',
                CONSTRAINT "uq_accounts_user_id" UNIQUE ("user_id"),
                CONSTRAINT "REL_3000dad1da61b29953f0747632" UNIQUE ("user_id"),
                CONSTRAINT "pk_accounts_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_accounts_user_id" ON "accounts" ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_accounts_organization_id" ON "accounts" ("organization_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_accounts_type" ON "accounts" ("type")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_accounts_status" ON "accounts" ("status")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_accounts_invitation_token" ON "accounts" ("invitation_token")
            WHERE "invitation_token" IS NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_accounts_location" ON "accounts" USING GiST ("location")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_accounts_is_verified" ON "accounts" ("is_verified")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_accounts_organization_id_user_id" ON "accounts" ("organization_id", "user_id")
            WHERE "organization_id" IS NOT NULL
                AND "user_id" IS NOT NULL
        `);
    await queryRunner.query(`
            CREATE TABLE "staff_services" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "staff_id" character varying NOT NULL,
                "service_id" character varying NOT NULL,
                CONSTRAINT "uq_staff_services_staff_id_service_id" UNIQUE ("staff_id", "service_id"),
                CONSTRAINT "pk_staff_services_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_staff_services_staff_id" ON "staff_services" ("staff_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_staff_services_service_id" ON "staff_services" ("service_id")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."time_slots_status_enum" AS ENUM('available', 'booked', 'blocked')
        `);
    await queryRunner.query(`
            CREATE TABLE "time_slots" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "location_id" character varying NOT NULL,
                "staff_id" uuid,
                "date" date NOT NULL,
                "start_time" TIME NOT NULL,
                "end_time" TIME NOT NULL,
                "status" "public"."time_slots_status_enum" NOT NULL DEFAULT 'available',
                "booking_id" character varying,
                CONSTRAINT "uq_time_slots_location_id_staff_id_date_start_time" UNIQUE ("location_id", "staff_id", "date", "start_time"),
                CONSTRAINT "pk_time_slots_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_time_slots_location_id" ON "time_slots" ("location_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_time_slots_staff_id" ON "time_slots" ("staff_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_time_slots_date" ON "time_slots" ("date")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_time_slots_location_id_date_status" ON "time_slots" ("location_id", "date", "status")
        `);
    await queryRunner.query(`
            CREATE TABLE "user_profiles" (
                "user_id" character varying NOT NULL,
                "avatar" text,
                "bio" text,
                "phone" character varying(20),
                "address" text,
                "date_of_birth" date,
                "gender" character varying(20),
                "preferences" jsonb DEFAULT '{}',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "pk_user_profiles_user_id" PRIMARY KEY ("user_id")
            )
        `);
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
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "wallet_id" character varying NOT NULL,
                "type" "public"."wallet_transactions_type_enum" NOT NULL,
                "amount" numeric(15, 2) NOT NULL,
                "balance_after" numeric(15, 2) NOT NULL,
                "currency" character varying(3) NOT NULL DEFAULT 'VND',
                "reference_type" character varying(50),
                "reference_id" uuid,
                "description" text NOT NULL,
                CONSTRAINT "pk_wallet_transactions_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wallet_transactions_wallet_id" ON "wallet_transactions" ("wallet_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wallet_transactions_reference_type" ON "wallet_transactions" ("reference_type")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wallet_transactions_reference_id" ON "wallet_transactions" ("reference_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wallet_transactions_wallet_id_created_at" ON "wallet_transactions" ("wallet_id", "created_at")
        `);
    await queryRunner.query(`
            CREATE TABLE "wallets" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "user_id" character varying NOT NULL,
                "balance" numeric(15, 2) NOT NULL DEFAULT '0',
                "currency" character varying(3) NOT NULL DEFAULT 'VND',
                CONSTRAINT "uq_wallets_user_id" UNIQUE ("user_id"),
                CONSTRAINT "REL_92558c08091598f7a4439586cd" UNIQUE ("user_id"),
                CONSTRAINT "CHK_1c1bf32c2aa1b0f104543f3d6a" CHECK ("balance" >= 0),
                CONSTRAINT "pk_wallets_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wallets_user_id" ON "wallets" ("user_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "account_galleries" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "account_id" character varying(255) NOT NULL,
                "image_url" character varying(500) NOT NULL,
                "storage_key" character varying(500),
                "caption" character varying(500),
                "sort_order" integer NOT NULL DEFAULT '0',
                CONSTRAINT "pk_account_galleries_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_account_galleries_account_id" ON "account_galleries" ("account_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_account_galleries_account_id_sort_order" ON "account_galleries" ("account_id", "sort_order")
        `);
    await queryRunner.query(`
            CREATE TABLE "wards" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "code" character varying(10) NOT NULL,
                "name" character varying(255) NOT NULL,
                "name_en" character varying(255),
                "slug" character varying(255) NOT NULL,
                "type" character varying(50) NOT NULL,
                "district_id" character varying(255) NOT NULL,
                "latitude" real,
                "longitude" real,
                "metadata" jsonb,
                "is_active" boolean NOT NULL DEFAULT true,
                "order" integer NOT NULL DEFAULT '0',
                CONSTRAINT "uq_wards_code" UNIQUE ("code"),
                CONSTRAINT "pk_wards_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wards_is_active" ON "wards" ("is_active")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wards_district_id" ON "wards" ("district_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_wards_slug" ON "wards" ("slug")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_wards_district_id_code" ON "wards" ("district_id", "code")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_wards_code" ON "wards" ("code")
        `);
    await queryRunner.query(`
            CREATE TABLE "districts" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "code" character varying(10) NOT NULL,
                "name" character varying(255) NOT NULL,
                "name_en" character varying(255),
                "slug" character varying(255) NOT NULL,
                "type" character varying(50) NOT NULL,
                "province_id" character varying(255) NOT NULL,
                "latitude" real,
                "longitude" real,
                "metadata" jsonb,
                "is_active" boolean NOT NULL DEFAULT true,
                "order" integer NOT NULL DEFAULT '0',
                CONSTRAINT "uq_districts_code" UNIQUE ("code"),
                CONSTRAINT "pk_districts_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_districts_is_active" ON "districts" ("is_active")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_districts_province_id" ON "districts" ("province_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_districts_slug" ON "districts" ("slug")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_districts_province_id_code" ON "districts" ("province_id", "code")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_districts_code" ON "districts" ("code")
        `);
    await queryRunner.query(`
            CREATE TABLE "provinces" (
                "id" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "code" character varying(10) NOT NULL,
                "name" character varying(255) NOT NULL,
                "name_en" character varying(255),
                "slug" character varying(255) NOT NULL,
                "type" character varying(50) NOT NULL,
                "latitude" real,
                "longitude" real,
                "metadata" jsonb,
                "is_active" boolean NOT NULL DEFAULT true,
                "order" integer NOT NULL DEFAULT '0',
                CONSTRAINT "uq_provinces_code" UNIQUE ("code"),
                CONSTRAINT "uq_provinces_slug" UNIQUE ("slug"),
                CONSTRAINT "pk_provinces_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_provinces_is_active" ON "provinces" ("is_active")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_provinces_slug" ON "provinces" ("slug")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_provinces_code" ON "provinces" ("code")
        `);
    await queryRunner.query(`
            CREATE TABLE "role_permissions" (
                "role_id" character varying(255) NOT NULL,
                "permission_id" character varying(255) NOT NULL,
                CONSTRAINT "pk_role_permissions_role_id_permission_id" PRIMARY KEY ("role_id", "permission_id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_role_permissions_role_id" ON "role_permissions" ("role_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_role_permissions_permission_id" ON "role_permissions" ("permission_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "user_roles" (
                "user_id" character varying(255) NOT NULL,
                "role_id" character varying(255) NOT NULL,
                CONSTRAINT "pk_user_roles_user_id_role_id" PRIMARY KEY ("user_id", "role_id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_user_roles_user_id" ON "user_roles" ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_user_roles_role_id" ON "user_roles" ("role_id")
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
            ALTER TABLE "user_profiles"
            ADD CONSTRAINT "fk_user_profiles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions"
            ADD CONSTRAINT "fk_wallet_transactions_wallet_id" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets"
            ADD CONSTRAINT "fk_wallets_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "account_galleries"
            ADD CONSTRAINT "fk_account_galleries_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "wards"
            ADD CONSTRAINT "fk_wards_district_id" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "districts"
            ADD CONSTRAINT "fk_districts_province_id" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "role_permissions"
            ADD CONSTRAINT "fk_role_permissions_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "role_permissions"
            ADD CONSTRAINT "fk_role_permissions_permission_id" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "fk_user_roles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "fk_user_roles_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_roles" DROP CONSTRAINT "fk_user_roles_role_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_roles" DROP CONSTRAINT "fk_user_roles_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "role_permissions" DROP CONSTRAINT "fk_role_permissions_permission_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "role_permissions" DROP CONSTRAINT "fk_role_permissions_role_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "districts" DROP CONSTRAINT "fk_districts_province_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wards" DROP CONSTRAINT "fk_wards_district_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "account_galleries" DROP CONSTRAINT "fk_account_galleries_account_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets" DROP CONSTRAINT "fk_wallets_user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions" DROP CONSTRAINT "fk_wallet_transactions_wallet_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_profiles" DROP CONSTRAINT "fk_user_profiles_user_id"
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
            ALTER TABLE "booking_services" DROP CONSTRAINT "fk_booking_services_booking_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP CONSTRAINT "fk_bookings_location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP CONSTRAINT "fk_bookings_organization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP CONSTRAINT "fk_bookings_customer_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "organization_locations" DROP CONSTRAINT "fk_organization_locations_organization_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_user_roles_role_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_user_roles_user_id"
        `);
    await queryRunner.query(`
            DROP TABLE "user_roles"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_role_permissions_permission_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_role_permissions_role_id"
        `);
    await queryRunner.query(`
            DROP TABLE "role_permissions"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_provinces_code"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_provinces_slug"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_provinces_is_active"
        `);
    await queryRunner.query(`
            DROP TABLE "provinces"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_districts_code"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_districts_province_id_code"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_districts_slug"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_districts_province_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_districts_is_active"
        `);
    await queryRunner.query(`
            DROP TABLE "districts"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wards_code"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wards_district_id_code"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wards_slug"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wards_district_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wards_is_active"
        `);
    await queryRunner.query(`
            DROP TABLE "wards"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_account_galleries_account_id_sort_order"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_account_galleries_account_id"
        `);
    await queryRunner.query(`
            DROP TABLE "account_galleries"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wallets_user_id"
        `);
    await queryRunner.query(`
            DROP TABLE "wallets"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wallet_transactions_wallet_id_created_at"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wallet_transactions_reference_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wallet_transactions_reference_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_wallet_transactions_wallet_id"
        `);
    await queryRunner.query(`
            DROP TABLE "wallet_transactions"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."wallet_transactions_type_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "user_profiles"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_time_slots_location_id_date_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_time_slots_date"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_time_slots_staff_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_time_slots_location_id"
        `);
    await queryRunner.query(`
            DROP TABLE "time_slots"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."time_slots_status_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_staff_services_service_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_staff_services_staff_id"
        `);
    await queryRunner.query(`
            DROP TABLE "staff_services"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_accounts_organization_id_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_accounts_is_verified"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_accounts_location"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_accounts_invitation_token"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_accounts_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_accounts_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_accounts_organization_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_accounts_user_id"
        `);
    await queryRunner.query(`
            DROP TABLE "accounts"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."accounts_invitation_status_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."accounts_status_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."accounts_role_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."accounts_type_enum"
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
            DROP TABLE "services"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."services_booking_type_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_service_categories_is_active"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_service_categories_parent_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_service_categories_slug"
        `);
    await queryRunner.query(`
            DROP TABLE "service_categories"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_refresh_tokens_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_refresh_tokens_token"
        `);
    await queryRunner.query(`
            DROP TABLE "refresh_tokens"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_password_reset_tokens_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_password_reset_tokens_token"
        `);
    await queryRunner.query(`
            DROP TABLE "password_reset_tokens"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_operating_hours_location_id"
        `);
    await queryRunner.query(`
            DROP TABLE "operating_hours"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_email_verification_tokens_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_email_verification_tokens_token"
        `);
    await queryRunner.query(`
            DROP TABLE "email_verification_tokens"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_booking_services_booking_id"
        `);
    await queryRunner.query(`
            DROP TABLE "booking_services"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_customer_id_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_organization_id_scheduled_date"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_scheduled_date"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_location_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_organization_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_bookings_customer_id"
        `);
    await queryRunner.query(`
            DROP TABLE "bookings"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."bookings_status_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_users_email"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_roles_name_organization_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_roles_organization_id"
        `);
    await queryRunner.query(`
            DROP TABLE "roles"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_permissions_resource"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_permissions_code"
        `);
    await queryRunner.query(`
            DROP TABLE "permissions"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_organization_locations_location"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_organization_locations_organization_id"
        `);
    await queryRunner.query(`
            DROP TABLE "organization_locations"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_organizations_status"
        `);
    await queryRunner.query(`
            DROP TABLE "organizations"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."organizations_status_enum"
        `);
  }
}
