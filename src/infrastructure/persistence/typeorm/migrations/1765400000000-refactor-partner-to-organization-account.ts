import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorPartnerToOrganizationAccount1765400000000 implements MigrationInterface {
  name = 'RefactorPartnerToOrganizationAccount1765400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create enum types for new tables
    await queryRunner.query(`
      CREATE TYPE "public"."organizations_status_enum" AS ENUM ('pending', 'active', 'suspended', 'rejected')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."accounts_type_enum" AS ENUM ('individual', 'business')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."accounts_role_enum" AS ENUM ('owner', 'manager', 'member')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."accounts_status_enum" AS ENUM ('pending', 'active', 'suspended', 'rejected')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."accounts_invitation_status_enum" AS ENUM ('pending', 'accepted', 'declined', 'expired')
    `);

    // 2. Create organizations table (merge partners + partner_businesses for BUSINESS type)
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid NOT NULL,
        "status" "public"."organizations_status_enum" NOT NULL DEFAULT 'pending',
        "description" text,
        "rating" decimal(3,2) DEFAULT 0,
        "reviewCount" integer DEFAULT 0,
        "isHomeServiceEnabled" boolean DEFAULT false,
        "homeServiceRadiusKm" decimal(5,2),
        "rejectionReason" text,
        "approvedAt" TIMESTAMP,
        "approvedBy" uuid,
        "businessName" varchar(200) NOT NULL,
        "taxId" varchar(50),
        "businessLicense" varchar(100),
        "companySize" varchar(20),
        "website" varchar(255),
        "socialMedia" jsonb DEFAULT '{}',
        "establishedDate" date,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_organizations" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_organizations_status" ON "organizations" ("status")
    `);

    // 3. Create accounts table
    await queryRunner.query(`
      CREATE TABLE "accounts" (
        "id" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "organizationId" uuid,
        "type" "public"."accounts_type_enum" NOT NULL,
        "role" "public"."accounts_role_enum",
        "displayName" varchar(200) NOT NULL,
        "specialization" varchar(100),
        "yearsExperience" smallint,
        "certifications" jsonb DEFAULT '[]',
        "portfolio" text,
        "personalBio" text,
        "status" "public"."accounts_status_enum" NOT NULL DEFAULT 'pending',
        "invitationStatus" "public"."accounts_invitation_status_enum",
        "invitationToken" uuid,
        "invitedAt" TIMESTAMP,
        "acceptedAt" TIMESTAMP,
        "isActive" boolean DEFAULT true,
        "approvedAt" TIMESTAMP,
        "approvedBy" uuid,
        "rejectionReason" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_accounts" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_accounts_userId" UNIQUE ("userId"),
        CONSTRAINT "FK_accounts_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_accounts_organization" FOREIGN KEY ("organizationId")
          REFERENCES "organizations"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_accounts_userId" ON "accounts" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_accounts_organizationId" ON "accounts" ("organizationId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_accounts_type" ON "accounts" ("type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_accounts_status" ON "accounts" ("status")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_accounts_invitationToken" ON "accounts" ("invitationToken")
      WHERE "invitationToken" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_accounts_org_user" ON "accounts" ("organizationId", "userId")
      WHERE "organizationId" IS NOT NULL AND "userId" IS NOT NULL
    `);

    // 4. Migrate BUSINESS partners to organizations
    await queryRunner.query(`
      INSERT INTO "organizations" (
        "id", "status", "description", "rating", "reviewCount",
        "isHomeServiceEnabled", "homeServiceRadiusKm", "rejectionReason",
        "approvedAt", "approvedBy", "businessName", "taxId", "businessLicense",
        "companySize", "website", "socialMedia", "establishedDate",
        "createdAt", "updatedAt"
      )
      SELECT
        p."id",
        p."status"::"public"."organizations_status_enum",
        p."description",
        p."rating",
        p."reviewCount",
        p."isHomeServiceEnabled",
        p."homeServiceRadiusKm",
        p."rejectionReason",
        p."approvedAt",
        p."approvedBy",
        pb."businessName",
        pb."taxId",
        pb."businessLicense",
        pb."companySize",
        pb."website",
        pb."socialMedia",
        pb."establishedDate",
        p."createdAt",
        p."updatedAt"
      FROM "partners" p
      JOIN "partner_businesses" pb ON p."id" = pb."partnerId"
      WHERE p."type" = 'business'
    `);

    // 5. Migrate INDIVIDUAL partners to accounts (no organization)
    await queryRunner.query(`
      INSERT INTO "accounts" (
        "id", "userId", "organizationId", "type", "role",
        "displayName", "specialization", "yearsExperience",
        "certifications", "portfolio", "personalBio",
        "status", "invitationStatus", "isActive",
        "approvedAt", "approvedBy", "rejectionReason",
        "createdAt", "updatedAt"
      )
      SELECT
        gen_random_uuid(),
        p."userId",
        NULL,
        'individual'::"public"."accounts_type_enum",
        NULL,
        pi."displayName",
        pi."specialization",
        pi."yearsExperience",
        pi."certifications",
        pi."portfolio",
        pi."personalBio",
        p."status"::"public"."accounts_status_enum",
        NULL,
        (p."status" = 'active'),
        p."approvedAt",
        p."approvedBy",
        p."rejectionReason",
        p."createdAt",
        p."updatedAt"
      FROM "partners" p
      JOIN "partner_individuals" pi ON p."id" = pi."partnerId"
      WHERE p."type" = 'individual'
    `);

    // 6. Migrate partner_staff to accounts (with organization)
    await queryRunner.query(`
      INSERT INTO "accounts" (
        "id", "userId", "organizationId", "type", "role",
        "displayName", "status", "invitationStatus", "invitationToken",
        "invitedAt", "acceptedAt", "isActive",
        "createdAt", "updatedAt"
      )
      SELECT
        ps."id",
        COALESCE(ps."userId", '00000000-0000-0000-0000-000000000000'),
        ps."partnerId",
        'business'::"public"."accounts_type_enum",
        CASE
          WHEN ps."role" = 'owner' THEN 'owner'::"public"."accounts_role_enum"
          WHEN ps."role" = 'manager' THEN 'manager'::"public"."accounts_role_enum"
          ELSE 'member'::"public"."accounts_role_enum"
        END,
        COALESCE(u."firstName" || ' ' || u."lastName", ps."email"),
        CASE
          WHEN ps."invitationStatus" = 'accepted' THEN 'active'::"public"."accounts_status_enum"
          ELSE 'pending'::"public"."accounts_status_enum"
        END,
        ps."invitationStatus"::"public"."accounts_invitation_status_enum",
        ps."invitationToken",
        ps."invitedAt",
        ps."acceptedAt",
        ps."isActive",
        ps."createdAt",
        ps."updatedAt"
      FROM "partner_staff" ps
      LEFT JOIN "users" u ON ps."userId" = u."id"
    `);

    // 7. Check if services table exists and update foreign key
    const servicesTableExists = (await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'services'
      )
    `)) as { exists: boolean }[];

    if (servicesTableExists[0]?.exists) {
      // Drop old FK if exists
      await queryRunner.query(`
        ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "FK_services_partner"
      `);

      // Rename column
      await queryRunner.query(`
        ALTER TABLE "services" RENAME COLUMN "partnerId" TO "organizationId"
      `);

      // Add new FK
      await queryRunner.query(`
        ALTER TABLE "services" ADD CONSTRAINT "FK_services_organization"
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
      `);
    }

    // 8. Check if bookings table exists and update foreign key
    const bookingsTableExists = (await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'bookings'
      )
    `)) as { exists: boolean }[];

    if (bookingsTableExists[0]?.exists) {
      // Drop old FK if exists
      await queryRunner.query(`
        ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_partner"
      `);

      // Rename column
      await queryRunner.query(`
        ALTER TABLE "bookings" RENAME COLUMN "partnerId" TO "organizationId"
      `);

      // Add new FK
      await queryRunner.query(`
        ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_organization"
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
      `);
    }

    // 9. Rename partner_locations to organization_locations
    const partnerLocationsExists = (await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'partner_locations'
      )
    `)) as { exists: boolean }[];

    if (partnerLocationsExists[0]?.exists) {
      await queryRunner.query(`
        ALTER TABLE "partner_locations" DROP CONSTRAINT IF EXISTS "FK_partner_locations_partner"
      `);

      await queryRunner.query(`
        ALTER TABLE "partner_locations" RENAME TO "organization_locations"
      `);

      await queryRunner.query(`
        ALTER TABLE "organization_locations" RENAME COLUMN "partnerId" TO "organizationId"
      `);

      await queryRunner.query(`
        ALTER TABLE "organization_locations" ADD CONSTRAINT "FK_organization_locations_organization"
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
      `);
    }

    // 10. Rename partner_documents to organization_documents
    const partnerDocumentsExists = (await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'partner_documents'
      )
    `)) as { exists: boolean }[];

    if (partnerDocumentsExists[0]?.exists) {
      await queryRunner.query(`
        ALTER TABLE "partner_documents" DROP CONSTRAINT IF EXISTS "FK_partner_documents_partner"
      `);

      await queryRunner.query(`
        ALTER TABLE "partner_documents" RENAME TO "organization_documents"
      `);

      await queryRunner.query(`
        ALTER TABLE "organization_documents" RENAME COLUMN "partnerId" TO "organizationId"
      `);

      await queryRunner.query(`
        ALTER TABLE "organization_documents" ADD CONSTRAINT "FK_organization_documents_organization"
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
      `);
    }

    // 11. Drop old tables
    await queryRunner.query(`DROP TABLE IF EXISTS "partner_staff"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "partner_individuals"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "partner_businesses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "partners"`);

    // 12. Drop old enum types
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."partners_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."partners_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."partner_staff_role_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."partner_staff_invitationstatus_enum"`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
  public async down(_queryRunner: QueryRunner): Promise<void> {
    // This is a complex migration - down migration would need to reverse all changes
    // For safety, we'll throw an error suggesting manual intervention
    throw new Error(
      'This migration cannot be automatically reverted. Please restore from backup.',
    );
  }
}
