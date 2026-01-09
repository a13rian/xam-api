import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1767871142849 implements MigrationInterface {
  name = 'Migration1767871142849';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "last_login_at" TIMESTAMP WITH TIME ZONE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "last_login_at"
        `);
  }
}
