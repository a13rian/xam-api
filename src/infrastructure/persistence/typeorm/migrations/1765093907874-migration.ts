import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765093907874 implements MigrationInterface {
  name = 'Migration1765093907874';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "organizations" (
                "id" uuid NOT NULL,
                "name" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "description" text,
                "settings" jsonb NOT NULL DEFAULT '{}',
                "isActive" boolean NOT NULL DEFAULT true,
                "ownerId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_963693341bd612aa01ddf3a4b68" UNIQUE ("slug"),
                CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_963693341bd612aa01ddf3a4b6" ON "organizations" ("slug")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_cdf778d13ea7fe8095e013e34f" ON "organizations" ("ownerId")
        `);
    await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" uuid NOT NULL,
                "code" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" text,
                "resource" character varying NOT NULL,
                "action" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_8dad765629e83229da6feda1c1d" UNIQUE ("code"),
                CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_8dad765629e83229da6feda1c1" ON "permissions" ("code")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_89456a09b598ce8915c702c528" ON "permissions" ("resource")
        `);
    await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" uuid NOT NULL,
                "name" character varying NOT NULL,
                "description" text,
                "isSystem" boolean NOT NULL DEFAULT false,
                "organizationId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_0933e1dfb2993d672af1a98f08" ON "roles" ("organizationId")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_d27a5e69fb41256abed347a85e" ON "roles" ("name", "organizationId")
        `);
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL,
                "email" character varying NOT NULL,
                "passwordHash" character varying NOT NULL,
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "emailVerifiedAt" TIMESTAMP,
                "organizationId" uuid,
                "failedLoginAttempts" integer NOT NULL DEFAULT '0',
                "lockedUntil" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_f3d6aea8fcca58182b2e80ce97" ON "users" ("organizationId")
        `);
    await queryRunner.query(`
            CREATE TABLE "refresh_tokens" (
                "id" uuid NOT NULL,
                "token" character varying NOT NULL,
                "userId" uuid NOT NULL,
                "userAgent" character varying,
                "ipAddress" character varying,
                "expiresAt" TIMESTAMP NOT NULL,
                "isRevoked" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_4542dd2f38a61354a040ba9fd5" ON "refresh_tokens" ("token")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_610102b60fea1455310ccd299d" ON "refresh_tokens" ("userId")
        `);
    await queryRunner.query(`
            CREATE TABLE "password_reset_tokens" (
                "id" uuid NOT NULL,
                "token" character varying NOT NULL,
                "userId" uuid NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "isUsed" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_ab673f0e63eac966762155508e" ON "password_reset_tokens" ("token")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d6a19d4b4f6c62dcd29daa497e" ON "password_reset_tokens" ("userId")
        `);
    await queryRunner.query(`
            CREATE TABLE "email_verification_tokens" (
                "id" uuid NOT NULL,
                "token" character varying NOT NULL,
                "userId" uuid NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "isUsed" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_417a095bbed21c2369a6a01ab9a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_3d1613f95c6a564a3b588d161a" ON "email_verification_tokens" ("token")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_10f285d038feb767bf7c2da14b" ON "email_verification_tokens" ("userId")
        `);
    await queryRunner.query(`
            CREATE TABLE "role_permissions" (
                "roleId" uuid NOT NULL,
                "permissionId" uuid NOT NULL,
                CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03" PRIMARY KEY ("roleId", "permissionId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b4599f8b8f548d35850afa2d12" ON "role_permissions" ("roleId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_06792d0c62ce6b0203c03643cd" ON "role_permissions" ("permissionId")
        `);
    await queryRunner.query(`
            CREATE TABLE "user_roles" (
                "userId" uuid NOT NULL,
                "roleId" uuid NOT NULL,
                CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475" PRIMARY KEY ("userId", "roleId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_472b25323af01488f1f66a06b6" ON "user_roles" ("userId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_86033897c009fcca8b6505d6be" ON "user_roles" ("roleId")
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_f3d6aea8fcca58182b2e80ce979" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens"
            ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "password_reset_tokens"
            ADD CONSTRAINT "FK_d6a19d4b4f6c62dcd29daa497e2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "email_verification_tokens"
            ADD CONSTRAINT "FK_10f285d038feb767bf7c2da14b3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "role_permissions"
            ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "role_permissions"
            ADD CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "FK_86033897c009fcca8b6505d6be2" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_roles" DROP CONSTRAINT "FK_86033897c009fcca8b6505d6be2"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"
        `);
    await queryRunner.query(`
            ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd"
        `);
    await queryRunner.query(`
            ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c"
        `);
    await queryRunner.query(`
            ALTER TABLE "email_verification_tokens" DROP CONSTRAINT "FK_10f285d038feb767bf7c2da14b3"
        `);
    await queryRunner.query(`
            ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_d6a19d4b4f6c62dcd29daa497e2"
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_f3d6aea8fcca58182b2e80ce979"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_86033897c009fcca8b6505d6be"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_472b25323af01488f1f66a06b6"
        `);
    await queryRunner.query(`
            DROP TABLE "user_roles"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_06792d0c62ce6b0203c03643cd"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b4599f8b8f548d35850afa2d12"
        `);
    await queryRunner.query(`
            DROP TABLE "role_permissions"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_10f285d038feb767bf7c2da14b"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_3d1613f95c6a564a3b588d161a"
        `);
    await queryRunner.query(`
            DROP TABLE "email_verification_tokens"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_d6a19d4b4f6c62dcd29daa497e"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ab673f0e63eac966762155508e"
        `);
    await queryRunner.query(`
            DROP TABLE "password_reset_tokens"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_610102b60fea1455310ccd299d"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_4542dd2f38a61354a040ba9fd5"
        `);
    await queryRunner.query(`
            DROP TABLE "refresh_tokens"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_f3d6aea8fcca58182b2e80ce97"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_d27a5e69fb41256abed347a85e"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_0933e1dfb2993d672af1a98f08"
        `);
    await queryRunner.query(`
            DROP TABLE "roles"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_89456a09b598ce8915c702c528"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_8dad765629e83229da6feda1c1"
        `);
    await queryRunner.query(`
            DROP TABLE "permissions"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_cdf778d13ea7fe8095e013e34f"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_963693341bd612aa01ddf3a4b6"
        `);
    await queryRunner.query(`
            DROP TABLE "organizations"
        `);
  }
}
