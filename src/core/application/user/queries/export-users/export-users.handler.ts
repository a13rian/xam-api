import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ExportUsersQuery } from './export-users.query';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';

export interface ExportUsersResult {
  csvContent: string;
  filename: string;
}

@QueryHandler(ExportUsersQuery)
export class ExportUsersHandler implements IQueryHandler<ExportUsersQuery> {
  private readonly logger = new Logger(ExportUsersHandler.name);
  private readonly MAX_EXPORT_LIMIT = 10000;

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: ExportUsersQuery): Promise<ExportUsersResult> {
    this.logger.log('Exporting users to CSV');

    // Fetch all users matching criteria (no pagination for export)
    const users = await this.userRepository.findAll({
      search: query.search,
      isActive: query.isActive,
      roleId: query.roleId,
      page: 1,
      limit: this.MAX_EXPORT_LIMIT,
    });

    // Generate CSV header
    const headers = [
      'ID',
      'Email',
      'First Name',
      'Last Name',
      'Phone',
      'Gender',
      'Date of Birth',
      'Status',
      'Email Verified',
      'Roles',
      'Failed Login Attempts',
      'Last Login',
      'Created At',
      'Updated At',
    ];

    // Generate CSV rows
    const rows = users.map((user) => [
      user.id,
      user.email.value,
      user.firstName,
      user.lastName,
      user.phone || '',
      user.gender || '',
      user.dateOfBirth?.toISOString().split('T')[0] || '',
      user.isActive ? 'Active' : 'Inactive',
      user.isEmailVerified ? 'Yes' : 'No',
      [...user.roleNames].join('; '),
      user.failedLoginAttempts.toString(),
      user.lastLoginAt?.toISOString() || 'Never',
      user.createdAt.toISOString(),
      user.updatedAt?.toISOString() || '',
    ]);

    // Build CSV content
    const csvContent = [
      headers.map((h) => this.escapeCSV(h)).join(','),
      ...rows.map((row) => row.map((v) => this.escapeCSV(String(v))).join(',')),
    ].join('\n');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `users-export-${timestamp}.csv`;

    this.logger.log(`Exported ${users.length} users to ${filename}`);

    return { csvContent, filename };
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
