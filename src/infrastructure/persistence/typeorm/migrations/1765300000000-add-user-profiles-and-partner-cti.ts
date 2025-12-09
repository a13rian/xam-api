import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfilesAndPartnerCti1765300000000 implements MigrationInterface {
  name = 'AddUserProfilesAndPartnerCti1765300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create user_profiles table
    await queryRunner.query(`
      CREATE TABLE "user_profiles" (
        "userId" uuid NOT NULL,
        "avatar" text,
        "bio" text,
        "phone" varchar(20),
        "address" text,
        "dateOfBirth" date,
        "gender" varchar(20),
        "preferences" jsonb DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_profiles" PRIMARY KEY ("userId"),
        CONSTRAINT "FK_user_profiles_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // 2. Create partner_businesses table
    await queryRunner.query(`
      CREATE TABLE "partner_businesses" (
        "partnerId" uuid NOT NULL,
        "businessName" varchar NOT NULL,
        "taxId" varchar(50),
        "businessLicense" varchar(100),
        "companySize" varchar(20),
        "website" varchar(255),
        "socialMedia" jsonb DEFAULT '{}',
        "establishedDate" date,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_partner_businesses" PRIMARY KEY ("partnerId"),
        CONSTRAINT "FK_partner_businesses_partner" FOREIGN KEY ("partnerId")
          REFERENCES "partners"("id") ON DELETE CASCADE
      )
    `);

    // 3. Create partner_individuals table
    await queryRunner.query(`
      CREATE TABLE "partner_individuals" (
        "partnerId" uuid NOT NULL,
        "displayName" varchar NOT NULL,
        "idCardNumber" varchar(20),
        "specialization" varchar(100),
        "yearsExperience" smallint,
        "certifications" jsonb DEFAULT '[]',
        "portfolio" text,
        "personalBio" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_partner_individuals" PRIMARY KEY ("partnerId"),
        CONSTRAINT "FK_partner_individuals_partner" FOREIGN KEY ("partnerId")
          REFERENCES "partners"("id") ON DELETE CASCADE
      )
    `);

    // 4. Update PartnerTypeEnum values (organization → business, freelance → individual)
    await queryRunner.query(`
      ALTER TYPE "public"."partners_type_enum" RENAME VALUE 'organization' TO 'business'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."partners_type_enum" RENAME VALUE 'freelance' TO 'individual'
    `);

    // 5. Migrate existing partners data to child tables
    await queryRunner.query(`
      INSERT INTO "partner_businesses" ("partnerId", "businessName", "createdAt", "updatedAt")
      SELECT "id", "businessName", "createdAt", "updatedAt"
      FROM "partners"
      WHERE "type" = 'business'
    `);

    await queryRunner.query(`
      INSERT INTO "partner_individuals" ("partnerId", "displayName", "createdAt", "updatedAt")
      SELECT "id", "businessName", "createdAt", "updatedAt"
      FROM "partners"
      WHERE "type" = 'individual'
    `);

    // 6. Remove businessName from partners table
    await queryRunner.query(`
      ALTER TABLE "partners" DROP COLUMN "businessName"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Add businessName back to partners
    await queryRunner.query(`
      ALTER TABLE "partners" ADD COLUMN "businessName" varchar
    `);

    // 2. Restore data from child tables
    await queryRunner.query(`
      UPDATE "partners" p
      SET "businessName" = pb."businessName"
      FROM "partner_businesses" pb
      WHERE p."id" = pb."partnerId"
    `);

    await queryRunner.query(`
      UPDATE "partners" p
      SET "businessName" = pi."displayName"
      FROM "partner_individuals" pi
      WHERE p."id" = pi."partnerId"
    `);

    // 3. Make businessName NOT NULL
    await queryRunner.query(`
      ALTER TABLE "partners" ALTER COLUMN "businessName" SET NOT NULL
    `);

    // 4. Revert PartnerTypeEnum values
    await queryRunner.query(`
      ALTER TYPE "public"."partners_type_enum" RENAME VALUE 'business' TO 'organization'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."partners_type_enum" RENAME VALUE 'individual' TO 'freelance'
    `);

    // 5. Drop child tables
    await queryRunner.query(`DROP TABLE "partner_individuals"`);
    await queryRunner.query(`DROP TABLE "partner_businesses"`);
    await queryRunner.query(`DROP TABLE "user_profiles"`);
  }
}
