import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountLocationFields1765648250503 implements MigrationInterface {
  name = 'AddAccountLocationFields1765648250503';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "accounts" ADD "street" text`);
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "ward" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "district" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "city" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "latitude" numeric(10,7)`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "longitude" numeric(10,7)`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "location" geography(Point,4326)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_accounts_location" ON "accounts" USING GiST ("location") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_accounts_location"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "location"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "longitude"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "latitude"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "district"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "ward"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "street"`);
  }
}
