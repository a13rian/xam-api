import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStorageFields1765800000000 implements MigrationInterface {
  name = 'AddStorageFields1765800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add storageKey column to account_gallery for tracking uploaded files
    await queryRunner.query(
      `ALTER TABLE "account_gallery" ADD "storageKey" character varying(500)`,
    );

    // Add avatarUrl column to users
    await queryRunner.query(
      `ALTER TABLE "users" ADD "avatarUrl" character varying(500)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove avatarUrl from users
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarUrl"`);

    // Remove storageKey from account_gallery
    await queryRunner.query(
      `ALTER TABLE "account_gallery" DROP COLUMN "storageKey"`,
    );
  }
}
