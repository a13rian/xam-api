import { DataSource, Repository } from 'typeorm';
import { INestApplication } from '@nestjs/common';

export class DatabaseHelper {
  constructor(private readonly dataSource: DataSource) {}

  static fromApp(app: INestApplication): DatabaseHelper {
    return new DatabaseHelper(app.get(DataSource));
  }

  async cleanDatabase(): Promise<void> {
    // Order matters due to foreign keys
    const tableOrder = [
      'refresh_tokens',
      'password_reset_tokens',
      'email_verification_tokens',
      'user_roles',
      'users',
      'organizations',
      'role_permissions',
      // Don't clear roles and permissions - they are seeded once
    ];

    for (const tableName of tableOrder) {
      try {
        await this.dataSource.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
      } catch {
        // Table might not exist, ignore
      }
    }
  }

  async cleanUsersAndOrganizations(): Promise<void> {
    // Clean only user-related data, keep permissions and roles
    const tableOrder = [
      'refresh_tokens',
      'password_reset_tokens',
      'email_verification_tokens',
      'user_roles',
      'users',
      'organizations',
    ];

    for (const tableName of tableOrder) {
      try {
        await this.dataSource.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
      } catch {
        // Table might not exist, ignore
      }
    }
  }

  getRepository<T extends object>(entity: new () => T): Repository<T> {
    return this.dataSource.getRepository(entity);
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }
}
