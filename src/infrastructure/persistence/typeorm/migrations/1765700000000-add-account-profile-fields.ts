import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountProfileFields1765700000000 implements MigrationInterface {
  name = 'AddAccountProfileFields1765700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Media fields
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "avatarUrl" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "coverImageUrl" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "videoIntroUrl" character varying(500)`,
    );

    // Contact & Social fields
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "phone" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "businessEmail" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "website" character varying(500)`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" ADD "socialLinks" jsonb`);

    // Professional/Service fields
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "tagline" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "serviceAreas" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "languages" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" ADD "workingHours" jsonb`);
    await queryRunner.query(`ALTER TABLE "accounts" ADD "priceRange" jsonb`);

    // Trust & Verification fields
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "isVerified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "verifiedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "badges" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" ADD "rating" numeric(2,1)`);
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "totalReviews" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "completedBookings" integer NOT NULL DEFAULT '0'`,
    );

    // Create index on isVerified
    await queryRunner.query(
      `CREATE INDEX "IDX_accounts_isVerified" ON "accounts" ("isVerified")`,
    );

    // Create account_gallery table
    await queryRunner.query(`
      CREATE TABLE "account_gallery" (
        "id" character varying(255) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "accountId" character varying(255) NOT NULL,
        "imageUrl" character varying(500) NOT NULL,
        "caption" character varying(500),
        "sortOrder" integer NOT NULL DEFAULT '0',
        CONSTRAINT "PK_account_gallery" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for account_gallery
    await queryRunner.query(
      `CREATE INDEX "IDX_account_gallery_accountId" ON "account_gallery" ("accountId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_account_gallery_accountId_sortOrder" ON "account_gallery" ("accountId", "sortOrder")`,
    );

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "account_gallery"
      ADD CONSTRAINT "FK_account_gallery_accountId"
      FOREIGN KEY ("accountId")
      REFERENCES "accounts"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key and account_gallery table
    await queryRunner.query(
      `ALTER TABLE "account_gallery" DROP CONSTRAINT "FK_account_gallery_accountId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_account_gallery_accountId_sortOrder"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_account_gallery_accountId"`,
    );
    await queryRunner.query(`DROP TABLE "account_gallery"`);

    // Drop index on isVerified
    await queryRunner.query(`DROP INDEX "public"."IDX_accounts_isVerified"`);

    // Drop Trust & Verification fields
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "completedBookings"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "totalReviews"`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "rating"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "badges"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "verifiedAt"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "isVerified"`);

    // Drop Professional/Service fields
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "priceRange"`);
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "workingHours"`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "languages"`);
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "serviceAreas"`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "tagline"`);

    // Drop Contact & Social fields
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "socialLinks"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "website"`);
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "businessEmail"`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "phone"`);

    // Drop Media fields
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "videoIntroUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "coverImageUrl"`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "avatarUrl"`);
  }
}
