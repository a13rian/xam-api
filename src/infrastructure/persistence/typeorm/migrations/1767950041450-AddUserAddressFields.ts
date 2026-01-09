import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAddressFields1767950041450 implements MigrationInterface {
  name = 'AddUserAddressFields1767950041450';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "last_login_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "street" text`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "ward" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "district" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "city" character varying(100)`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "latitude" numeric(10,7)`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "longitude" numeric(10,7)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "longitude"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "latitude"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "district"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "ward"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "street"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_login_at"`);
  }
}
