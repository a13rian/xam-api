import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765565035085 implements MigrationInterface {
  name = 'Migration1765565035085';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" uuid NOT NULL,
                "code" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" text,
                "resource" character varying NOT NULL,
                "action" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_8dad765629e83229da6feda1c1d" UNIQUE ("code"),
                CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_8dad765629e83229da6feda1c1" ON "permissions" ("code")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_89456a09b598ce8915c702c528" ON "permissions" ("resource")
        `);
    await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" uuid NOT NULL,
                "name" character varying NOT NULL,
                "description" text,
                "isSystem" boolean NOT NULL DEFAULT false,
                "organizationId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_0933e1dfb2993d672af1a98f08" ON "roles" ("organizationId")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_d27a5e69fb41256abed347a85e" ON "roles" ("name", "organizationId")
        `);
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL,
                "email" character varying NOT NULL,
                "passwordHash" character varying NOT NULL,
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "emailVerifiedAt" TIMESTAMP,
                "failedLoginAttempts" integer NOT NULL DEFAULT '0',
                "lockedUntil" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."organizations_status_enum" AS ENUM('pending', 'active', 'suspended', 'rejected')
        `);
    await queryRunner.query(`
            CREATE TABLE "organizations" (
                "id" uuid NOT NULL,
                "status" "public"."organizations_status_enum" NOT NULL,
                "description" text,
                "rating" numeric(3, 2) NOT NULL DEFAULT '0',
                "reviewCount" integer NOT NULL DEFAULT '0',
                "isHomeServiceEnabled" boolean NOT NULL DEFAULT false,
                "homeServiceRadiusKm" numeric(5, 2),
                "rejectionReason" text,
                "approvedAt" TIMESTAMP,
                "approvedBy" uuid,
                "businessName" character varying(200) NOT NULL,
                "taxId" character varying(50),
                "businessLicense" character varying(100),
                "companySize" character varying(20),
                "website" character varying(255),
                "socialMedia" jsonb NOT NULL DEFAULT '{}',
                "establishedDate" date,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_f3770f157bd77d83ab022e92fc" ON "organizations" ("status")
        `);
    await queryRunner.query(`
            CREATE TABLE "organization_locations" (
                "id" uuid NOT NULL,
                "organizationId" uuid NOT NULL,
                "name" character varying(200) NOT NULL,
                "street" text NOT NULL,
                "ward" character varying(100),
                "district" character varying(100) NOT NULL,
                "city" character varying(100) NOT NULL,
                "latitude" numeric(10, 7),
                "longitude" numeric(10, 7),
                "location" geography(Point, 4326),
                "phone" character varying(20),
                "isPrimary" boolean NOT NULL DEFAULT false,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_1067a088e0cb83a06b57ce3e504" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_efb3b71d563f232af27211511a" ON "organization_locations" ("organizationId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_organization_locations_location" ON "organization_locations" USING GiST ("location")
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
                "id" uuid NOT NULL,
                "customerId" uuid NOT NULL,
                "organizationId" uuid NOT NULL,
                "locationId" uuid NOT NULL,
                "staffId" uuid,
                "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'pending',
                "scheduledDate" date NOT NULL,
                "startTime" TIME NOT NULL,
                "endTime" TIME NOT NULL,
                "totalAmount" numeric(15, 2) NOT NULL,
                "paidAmount" numeric(15, 2) NOT NULL DEFAULT '0',
                "currency" character varying(3) NOT NULL DEFAULT 'VND',
                "isHomeService" boolean NOT NULL DEFAULT false,
                "customerAddress" text,
                "customerPhone" character varying(20) NOT NULL,
                "customerName" character varying(200) NOT NULL,
                "notes" text,
                "cancellationReason" text,
                "cancelledBy" uuid,
                "confirmedAt" TIMESTAMP,
                "startedAt" TIMESTAMP,
                "completedAt" TIMESTAMP,
                "cancelledAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_67b9cd20f987fc6dc70f7cd283" ON "bookings" ("customerId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_a7fbe16c4191734fb3d36ff531" ON "bookings" ("organizationId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b8cdcf29b7dea8578f7daf2e68" ON "bookings" ("locationId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_910f39bbc27a3fe62723500c01" ON "bookings" ("scheduledDate")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_81b0cecbec954d1e60cdc298df" ON "bookings" ("organizationId", "scheduledDate")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_383b9e492828e1e6ae76964565" ON "bookings" ("customerId", "status")
        `);
    await queryRunner.query(`
            CREATE TABLE "booking_services" (
                "id" uuid NOT NULL,
                "bookingId" uuid NOT NULL,
                "serviceId" uuid NOT NULL,
                "serviceName" character varying(200) NOT NULL,
                "price" numeric(15, 2) NOT NULL,
                "currency" character varying(3) NOT NULL DEFAULT 'VND',
                "durationMinutes" integer NOT NULL,
                CONSTRAINT "PK_8997bf4d0728c8740c87694d59a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_9a9d697fbd86c5285ed1662c7c" ON "booking_services" ("bookingId")
        `);
    await queryRunner.query(`
            CREATE TABLE "email_verification_tokens" (
                "id" uuid NOT NULL,
                "token" character varying NOT NULL,
                "userId" uuid NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "isUsed" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_417a095bbed21c2369a6a01ab9a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_3d1613f95c6a564a3b588d161a" ON "email_verification_tokens" ("token")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_10f285d038feb767bf7c2da14b" ON "email_verification_tokens" ("userId")
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
            CREATE TABLE "password_reset_tokens" (
                "id" uuid NOT NULL,
                "token" character varying NOT NULL,
                "userId" uuid NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "isUsed" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_ab673f0e63eac966762155508e" ON "password_reset_tokens" ("token")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d6a19d4b4f6c62dcd29daa497e" ON "password_reset_tokens" ("userId")
        `);
    await queryRunner.query(`
            CREATE TABLE "refresh_tokens" (
                "id" uuid NOT NULL,
                "token" character varying NOT NULL,
                "userId" uuid NOT NULL,
                "userAgent" character varying,
                "ipAddress" character varying,
                "expiresAt" TIMESTAMP NOT NULL,
                "isRevoked" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_4542dd2f38a61354a040ba9fd5" ON "refresh_tokens" ("token")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_610102b60fea1455310ccd299d" ON "refresh_tokens" ("userId")
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
            CREATE TYPE "public"."services_bookingtype_enum" AS ENUM('time_slot', 'calendar', 'walk_in')
        `);
    await queryRunner.query(`
            CREATE TABLE "services" (
                "id" uuid NOT NULL,
                "organizationId" uuid NOT NULL,
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
            CREATE INDEX "IDX_e8e52dffc3bcbf5d3a90364c7c" ON "services" ("organizationId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_034b52310c2d211bc979c3cc4e" ON "services" ("categoryId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_4bfcbad5c2463c4b7258f02a6c" ON "services" ("organizationId", "isActive")
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
            CREATE TYPE "public"."accounts_invitationstatus_enum" AS ENUM('pending', 'accepted', 'declined', 'expired')
        `);
    await queryRunner.query(`
            CREATE TABLE "accounts" (
                "id" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "organizationId" uuid,
                "type" "public"."accounts_type_enum" NOT NULL,
                "role" "public"."accounts_role_enum",
                "displayName" character varying(200) NOT NULL,
                "specialization" character varying(100),
                "yearsExperience" smallint,
                "certifications" jsonb NOT NULL DEFAULT '[]',
                "portfolio" text,
                "personalBio" text,
                "status" "public"."accounts_status_enum" NOT NULL,
                "invitationStatus" "public"."accounts_invitationstatus_enum",
                "invitationToken" uuid,
                "invitedAt" TIMESTAMP,
                "acceptedAt" TIMESTAMP,
                "isActive" boolean NOT NULL DEFAULT true,
                "approvedAt" TIMESTAMP,
                "approvedBy" uuid,
                "rejectionReason" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_3aa23c0a6d107393e8b40e3e2a6" UNIQUE ("userId"),
                CONSTRAINT "REL_3aa23c0a6d107393e8b40e3e2a" UNIQUE ("userId"),
                CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_3aa23c0a6d107393e8b40e3e2a" ON "accounts" ("userId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_02663e39fff0b001faf6dd6df5" ON "accounts" ("organizationId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_62471155681515721de014a625" ON "accounts" ("type")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_ecd806309a44545de35344424e" ON "accounts" ("status")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_e96b0a6481e0d8dd9795fc06ba" ON "accounts" ("invitationToken")
            WHERE "invitationToken" IS NOT NULL
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_df2f26222365cc6e2feeb28f52" ON "accounts" ("organizationId", "userId")
            WHERE "organizationId" IS NOT NULL
                AND "userId" IS NOT NULL
        `);
    await queryRunner.query(`
            CREATE TABLE "staff_services" (
                "id" uuid NOT NULL,
                "staffId" uuid NOT NULL,
                "serviceId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_0486423a17929cf5a2c0b7f4b14" UNIQUE ("staffId", "serviceId"),
                CONSTRAINT "PK_960130c8a280d6ae93ec9d04d12" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_536fadedfbced7381aa451a6cb" ON "staff_services" ("staffId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_1c3f741478b75745b885c329b9" ON "staff_services" ("serviceId")
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
            CREATE TABLE "user_profiles" (
                "userId" uuid NOT NULL,
                "avatar" text,
                "bio" text,
                "phone" character varying(20),
                "address" text,
                "dateOfBirth" date,
                "gender" character varying(20),
                "preferences" jsonb DEFAULT '{}',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8481388d6325e752cd4d7e26c6d" PRIMARY KEY ("userId")
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
            CREATE TABLE "role_permissions" (
                "roleId" uuid NOT NULL,
                "permissionId" uuid NOT NULL,
                CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03" PRIMARY KEY ("roleId", "permissionId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b4599f8b8f548d35850afa2d12" ON "role_permissions" ("roleId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_06792d0c62ce6b0203c03643cd" ON "role_permissions" ("permissionId")
        `);
    await queryRunner.query(`
            CREATE TABLE "user_roles" (
                "userId" uuid NOT NULL,
                "roleId" uuid NOT NULL,
                CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475" PRIMARY KEY ("userId", "roleId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_472b25323af01488f1f66a06b6" ON "user_roles" ("userId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_86033897c009fcca8b6505d6be" ON "user_roles" ("roleId")
        `);
    await queryRunner.query(`
            ALTER TABLE "organization_locations"
            ADD CONSTRAINT "FK_efb3b71d563f232af27211511af" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD CONSTRAINT "FK_67b9cd20f987fc6dc70f7cd283f" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD CONSTRAINT "FK_a7fbe16c4191734fb3d36ff531b" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD CONSTRAINT "FK_b8cdcf29b7dea8578f7daf2e686" FOREIGN KEY ("locationId") REFERENCES "organization_locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "booking_services"
            ADD CONSTRAINT "FK_9a9d697fbd86c5285ed1662c7c7" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "email_verification_tokens"
            ADD CONSTRAINT "FK_10f285d038feb767bf7c2da14b3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours"
            ADD CONSTRAINT "FK_7b42aad446b6a3bf051c4111597" FOREIGN KEY ("locationId") REFERENCES "organization_locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "password_reset_tokens"
            ADD CONSTRAINT "FK_d6a19d4b4f6c62dcd29daa497e2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens"
            ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "service_categories"
            ADD CONSTRAINT "FK_b91ff0fd7c961a3b296882e2a20" FOREIGN KEY ("parentId") REFERENCES "service_categories"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "services"
            ADD CONSTRAINT "FK_e8e52dffc3bcbf5d3a90364c7c5" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "services"
            ADD CONSTRAINT "FK_034b52310c2d211bc979c3cc4e8" FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD CONSTRAINT "FK_02663e39fff0b001faf6dd6df56" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services"
            ADD CONSTRAINT "FK_536fadedfbced7381aa451a6cba" FOREIGN KEY ("staffId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services"
            ADD CONSTRAINT "FK_1c3f741478b75745b885c329b9c" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots"
            ADD CONSTRAINT "FK_4d1ac68d000975f0fd8fa7046e9" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots"
            ADD CONSTRAINT "FK_aec1b1e2f00d8fc0eeb4889a8de" FOREIGN KEY ("locationId") REFERENCES "organization_locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_profiles"
            ADD CONSTRAINT "FK_8481388d6325e752cd4d7e26c6d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "role_permissions"
            ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "role_permissions"
            ADD CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "FK_86033897c009fcca8b6505d6be2" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_roles" DROP CONSTRAINT "FK_86033897c009fcca8b6505d6be2"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"
        `);
    await queryRunner.query(`
            ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd"
        `);
    await queryRunner.query(`
            ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_8481388d6325e752cd4d7e26c6d"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots" DROP CONSTRAINT "FK_aec1b1e2f00d8fc0eeb4889a8de"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slots" DROP CONSTRAINT "FK_4d1ac68d000975f0fd8fa7046e9"
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services" DROP CONSTRAINT "FK_1c3f741478b75745b885c329b9c"
        `);
    await queryRunner.query(`
            ALTER TABLE "staff_services" DROP CONSTRAINT "FK_536fadedfbced7381aa451a6cba"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP CONSTRAINT "FK_02663e39fff0b001faf6dd6df56"
        `);
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6"
        `);
    await queryRunner.query(`
            ALTER TABLE "services" DROP CONSTRAINT "FK_034b52310c2d211bc979c3cc4e8"
        `);
    await queryRunner.query(`
            ALTER TABLE "services" DROP CONSTRAINT "FK_e8e52dffc3bcbf5d3a90364c7c5"
        `);
    await queryRunner.query(`
            ALTER TABLE "service_categories" DROP CONSTRAINT "FK_b91ff0fd7c961a3b296882e2a20"
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"
        `);
    await queryRunner.query(`
            ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_d6a19d4b4f6c62dcd29daa497e2"
        `);
    await queryRunner.query(`
            ALTER TABLE "operating_hours" DROP CONSTRAINT "FK_7b42aad446b6a3bf051c4111597"
        `);
    await queryRunner.query(`
            ALTER TABLE "email_verification_tokens" DROP CONSTRAINT "FK_10f285d038feb767bf7c2da14b3"
        `);
    await queryRunner.query(`
            ALTER TABLE "booking_services" DROP CONSTRAINT "FK_9a9d697fbd86c5285ed1662c7c7"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP CONSTRAINT "FK_b8cdcf29b7dea8578f7daf2e686"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP CONSTRAINT "FK_a7fbe16c4191734fb3d36ff531b"
        `);
    await queryRunner.query(`
            ALTER TABLE "bookings" DROP CONSTRAINT "FK_67b9cd20f987fc6dc70f7cd283f"
        `);
    await queryRunner.query(`
            ALTER TABLE "organization_locations" DROP CONSTRAINT "FK_efb3b71d563f232af27211511af"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_86033897c009fcca8b6505d6be"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_472b25323af01488f1f66a06b6"
        `);
    await queryRunner.query(`
            DROP TABLE "user_roles"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_06792d0c62ce6b0203c03643cd"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b4599f8b8f548d35850afa2d12"
        `);
    await queryRunner.query(`
            DROP TABLE "role_permissions"
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
    await queryRunner.query(`
            DROP TABLE "user_profiles"
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
            DROP INDEX "public"."IDX_1c3f741478b75745b885c329b9"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_536fadedfbced7381aa451a6cb"
        `);
    await queryRunner.query(`
            DROP TABLE "staff_services"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_df2f26222365cc6e2feeb28f52"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_e96b0a6481e0d8dd9795fc06ba"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ecd806309a44545de35344424e"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_62471155681515721de014a625"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_02663e39fff0b001faf6dd6df5"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_3aa23c0a6d107393e8b40e3e2a"
        `);
    await queryRunner.query(`
            DROP TABLE "accounts"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."accounts_invitationstatus_enum"
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
            DROP INDEX "public"."IDX_4bfcbad5c2463c4b7258f02a6c"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_034b52310c2d211bc979c3cc4e"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_e8e52dffc3bcbf5d3a90364c7c"
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
            DROP INDEX "public"."IDX_610102b60fea1455310ccd299d"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_4542dd2f38a61354a040ba9fd5"
        `);
    await queryRunner.query(`
            DROP TABLE "refresh_tokens"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_d6a19d4b4f6c62dcd29daa497e"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ab673f0e63eac966762155508e"
        `);
    await queryRunner.query(`
            DROP TABLE "password_reset_tokens"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_7b42aad446b6a3bf051c411159"
        `);
    await queryRunner.query(`
            DROP TABLE "operating_hours"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_10f285d038feb767bf7c2da14b"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_3d1613f95c6a564a3b588d161a"
        `);
    await queryRunner.query(`
            DROP TABLE "email_verification_tokens"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_9a9d697fbd86c5285ed1662c7c"
        `);
    await queryRunner.query(`
            DROP TABLE "booking_services"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_383b9e492828e1e6ae76964565"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_81b0cecbec954d1e60cdc298df"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_910f39bbc27a3fe62723500c01"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b8cdcf29b7dea8578f7daf2e68"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_a7fbe16c4191734fb3d36ff531"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_67b9cd20f987fc6dc70f7cd283"
        `);
    await queryRunner.query(`
            DROP TABLE "bookings"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."bookings_status_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_organization_locations_location"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_efb3b71d563f232af27211511a"
        `);
    await queryRunner.query(`
            DROP TABLE "organization_locations"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_f3770f157bd77d83ab022e92fc"
        `);
    await queryRunner.query(`
            DROP TABLE "organizations"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."organizations_status_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_d27a5e69fb41256abed347a85e"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_0933e1dfb2993d672af1a98f08"
        `);
    await queryRunner.query(`
            DROP TABLE "roles"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_89456a09b598ce8915c702c528"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_8dad765629e83229da6feda1c1"
        `);
    await queryRunner.query(`
            DROP TABLE "permissions"
        `);
  }
}
