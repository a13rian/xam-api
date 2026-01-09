import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserListResponseDto,
  ListUsersQueryDto,
  NotificationSettingsDto,
  UpdateNotificationSettingsDto,
  AdminResetPasswordDto,
  BulkDeleteUsersDto,
  BulkUpdateStatusDto,
  BulkOperationResponseDto,
  ExportUsersQueryDto,
} from '../dto/user';
import { MessageResponseDto } from '../dto/common';
import {
  CreateUserCommand,
  UpdateUserCommand,
  DeleteUserCommand,
  UpdateUserAvatarCommand,
  RemoveUserAvatarCommand,
  UpdateAvatarResult,
  UpdateNotificationSettingsCommand,
  AdminResetPasswordCommand,
  BulkDeleteUsersCommand,
  BulkUpdateStatusCommand,
  BulkOperationResult,
} from '../../../core/application/user/commands';
import {
  GetUserQuery,
  ListUsersQuery,
  GetNotificationSettingsQuery,
  ExportUsersQuery,
  ExportUsersResult,
} from '../../../core/application/user/queries';
import { GetEntityAuditLogsQuery } from '../../../core/application/audit/queries';
import { EntityType } from '../../../core/domain/audit/entities/audit-log.entity';
import { AuditLogListResponseDto } from '../dto/audit';
import { ListAuditLogsResult } from '../../../core/domain/audit/repositories/audit-log.repository.interface';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions(PERMISSIONS.USER.CREATE)
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const result: { id: string } = await this.commandBus.execute(
      new CreateUserCommand(
        dto.email,
        dto.password,
        dto.firstName,
        dto.lastName,
        dto.roleIds,
      ),
    );

    return await this.queryBus.execute(new GetUserQuery(result.id));
  }

  @Get()
  @RequirePermissions(PERMISSIONS.USER.LIST)
  async findAll(
    @Query() query: ListUsersQueryDto,
  ): Promise<UserListResponseDto> {
    return await this.queryBus.execute(
      new ListUsersQuery(
        query.page,
        query.limit,
        query.search,
        query.isActive,
        query.roleId,
        query.isEmailVerified,
        query.createdFrom ? new Date(query.createdFrom) : undefined,
        query.createdTo ? new Date(query.createdTo) : undefined,
        query.lastLoginFrom ? new Date(query.lastLoginFrom) : undefined,
        query.lastLoginTo ? new Date(query.lastLoginTo) : undefined,
        query.sortBy,
        query.sortOrder,
      ),
    );
  }

  @Get('export')
  @RequirePermissions(PERMISSIONS.USER.LIST)
  @ApiOperation({ summary: 'Export users to CSV' })
  async exportUsers(
    @Query() query: ExportUsersQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.queryBus.execute<
      ExportUsersQuery,
      ExportUsersResult
    >(new ExportUsersQuery(query.search, query.isActive, query.roleId));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.csvContent);
  }

  @Post('bulk-delete')
  @RequirePermissions(PERMISSIONS.USER.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete users' })
  async bulkDelete(
    @Body() dto: BulkDeleteUsersDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BulkOperationResponseDto> {
    return await this.commandBus.execute<
      BulkDeleteUsersCommand,
      BulkOperationResult
    >(new BulkDeleteUsersCommand(dto.ids, user.id));
  }

  @Patch('bulk-status')
  @RequirePermissions(PERMISSIONS.USER.UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update user status (activate/deactivate)' })
  async bulkUpdateStatus(
    @Body() dto: BulkUpdateStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BulkOperationResponseDto> {
    return await this.commandBus.execute<
      BulkUpdateStatusCommand,
      BulkOperationResult
    >(new BulkUpdateStatusCommand(dto.ids, dto.isActive, user.id));
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USER.READ)
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.queryBus.execute(new GetUserQuery(id));
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.USER.UPDATE)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    await this.commandBus.execute(
      new UpdateUserCommand(
        id,
        dto.firstName,
        dto.lastName,
        dto.phone ?? null,
        dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        dto.gender ?? null,
        dto.roleIds,
        dto.isActive,
      ),
    );

    return await this.queryBus.execute(new GetUserQuery(id));
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.USER.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteUserCommand(id));
  }

  @Patch('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file',
        },
      },
    },
  })
  async uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({
            fileType: /image\/(jpeg|png|gif|webp)$/i,
            skipMagicNumbersValidation: true,
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ avatarUrl: string }> {
    const result = await this.commandBus.execute<
      UpdateUserAvatarCommand,
      UpdateAvatarResult
    >(
      new UpdateUserAvatarCommand(user.id, {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      }),
    );

    return { avatarUrl: result.avatarUrl };
  }

  @Delete('me/avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove user avatar' })
  async removeAvatar(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.commandBus.execute(new RemoveUserAvatarCommand(user.id));
  }

  @Get('me/notifications')
  @ApiOperation({ summary: 'Get current user notification settings' })
  async getNotificationSettings(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationSettingsDto> {
    return await this.queryBus.execute(
      new GetNotificationSettingsQuery(user.id),
    );
  }

  @Patch('me/notifications')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user notification settings' })
  async updateNotificationSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettingsDto> {
    return await this.commandBus.execute(
      new UpdateNotificationSettingsCommand(
        user.id,
        dto.emailNotifications,
        dto.pushNotifications,
        dto.marketingEmails,
        dto.bookingReminders,
      ),
    );
  }

  @Patch(':id/reset-password')
  @RequirePermissions(PERMISSIONS.USER.UPDATE)
  @ApiOperation({ summary: 'Reset user password (Admin only)' })
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: AdminResetPasswordDto,
  ): Promise<MessageResponseDto> {
    return await this.commandBus.execute(
      new AdminResetPasswordCommand(id, dto.password),
    );
  }

  @Patch(':id/avatar')
  @RequirePermissions(PERMISSIONS.USER.UPDATE)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload user avatar (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file',
        },
      },
    },
  })
  async uploadUserAvatar(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({
            fileType: /image\/(jpeg|png|gif|webp)$/i,
            skipMagicNumbersValidation: true,
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ avatarUrl: string }> {
    const result = await this.commandBus.execute<
      UpdateUserAvatarCommand,
      UpdateAvatarResult
    >(
      new UpdateUserAvatarCommand(id, {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      }),
    );

    return { avatarUrl: result.avatarUrl };
  }

  @Get(':id/audit-logs')
  @RequirePermissions(PERMISSIONS.AUDIT.READ)
  @ApiOperation({ summary: 'Get audit logs for a specific user' })
  async getUserAuditLogs(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<AuditLogListResponseDto> {
    const result = await this.queryBus.execute<
      GetEntityAuditLogsQuery,
      ListAuditLogsResult
    >(new GetEntityAuditLogsQuery(EntityType.USER, id, page || 1, limit || 20));

    return {
      items: result.items.map((log) => ({
        id: log.id,
        entityType: log.entityType,
        entityId: log.entityId,
        action: log.action,
        changes: log.changes,
        performedById: log.performedById,
        performedByEmail: log.performedByEmail,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        requestId: log.requestId,
        createdAt: log.createdAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
