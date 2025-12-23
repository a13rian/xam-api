import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUserProfiles1766439468484 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint first
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT IF EXISTS "fk_user_profiles_user_id"`,
    );

    // Drop the user_profiles table
    await queryRunner.query(`DROP TABLE IF EXISTS "user_profiles"`);

    // Drop years_experience and certifications columns from accounts
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN IF EXISTS "years_experience"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN IF EXISTS "certifications"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate years_experience and certifications columns in accounts
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD COLUMN "years_experience" smallint`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD COLUMN "certifications" jsonb DEFAULT '[]'`,
    );

    // Recreate the user_profiles table
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
        CONSTRAINT "pk_user_profiles" PRIMARY KEY ("user_id")
      )
    `);

    // Recreate foreign key
    await queryRunner.query(`
      ALTER TABLE "user_profiles"
      ADD CONSTRAINT "fk_user_profiles_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }
}
