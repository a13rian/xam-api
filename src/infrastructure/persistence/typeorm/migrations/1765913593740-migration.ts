import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765913593740 implements MigrationInterface {
  name = 'Migration1765913593740';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "notification_settings" jsonb NOT NULL DEFAULT '{"emailNotifications":true,"pushNotifications":true,"marketingEmails":false,"bookingReminders":true}'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "notification_settings"
        `);
  }
}
