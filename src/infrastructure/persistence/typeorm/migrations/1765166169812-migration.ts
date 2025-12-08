import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765166169812 implements MigrationInterface {
  name = 'Migration1765166169812';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
            CREATE TYPE "public"."partner_documents_type_enum" AS ENUM(
                'business_license',
                'id_card',
                'tax_certificate',
                'other'
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."partner_documents_status_enum" AS ENUM('pending', 'approved', 'rejected')
        `);
    await queryRunner.query(`
            CREATE TABLE "partner_documents" (
                "id" uuid NOT NULL,
                "partnerId" uuid NOT NULL,
                "type" "public"."partner_documents_type_enum" NOT NULL,
                "url" text NOT NULL,
                "status" "public"."partner_documents_status_enum" NOT NULL DEFAULT 'pending',
                "rejectionReason" text,
                "reviewedAt" TIMESTAMP,
                "reviewedBy" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_e66d0f3f5d88856d18749f8b77f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_feed69b0339f73a6e5919c0ac6" ON "partner_documents" ("partnerId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b04365f74df318ec30fc119fb9" ON "partner_documents" ("status")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."partners_type_enum" AS ENUM('freelance', 'organization')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."partners_status_enum" AS ENUM('pending', 'active', 'suspended', 'rejected')
        `);
    await queryRunner.query(`
            CREATE TABLE "partners" (
                "id" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "type" "public"."partners_type_enum" NOT NULL,
                "status" "public"."partners_status_enum" NOT NULL,
                "businessName" character varying NOT NULL,
                "description" text,
                "rating" numeric(3, 2) NOT NULL DEFAULT '0',
                "reviewCount" integer NOT NULL DEFAULT '0',
                "isHomeServiceEnabled" boolean NOT NULL DEFAULT false,
                "homeServiceRadiusKm" numeric(5, 2),
                "rejectionReason" text,
                "approvedAt" TIMESTAMP,
                "approvedBy" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_153a88a7708ead965846a8e048b" UNIQUE ("userId"),
                CONSTRAINT "REL_153a88a7708ead965846a8e048" UNIQUE ("userId"),
                CONSTRAINT "PK_998645b20820e4ab99aeae03b41" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_153a88a7708ead965846a8e048" ON "partners" ("userId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_f3d75b59fec91a3228a799509e" ON "partners" ("type")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_25deaed1efbf09835c54f74d6c" ON "partners" ("status")
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
            ALTER TABLE "partner_documents"
            ADD CONSTRAINT "FK_feed69b0339f73a6e5919c0ac65" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "partners"
            ADD CONSTRAINT "FK_153a88a7708ead965846a8e048b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "partners" DROP CONSTRAINT "FK_153a88a7708ead965846a8e048b"
        `);
    await queryRunner.query(`
            ALTER TABLE "partner_documents" DROP CONSTRAINT "FK_feed69b0339f73a6e5919c0ac65"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_25deaed1efbf09835c54f74d6c"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_f3d75b59fec91a3228a799509e"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_153a88a7708ead965846a8e048"
        `);
    await queryRunner.query(`
            DROP TABLE "partners"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."partners_status_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."partners_type_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b04365f74df318ec30fc119fb9"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_feed69b0339f73a6e5919c0ac6"
        `);
    await queryRunner.query(`
            DROP TABLE "partner_documents"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."partner_documents_status_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."partner_documents_type_enum"
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
  }
}
