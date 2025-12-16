import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
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
} from '../dto/user';
import {
  CreateUserCommand,
  UpdateUserCommand,
  DeleteUserCommand,
  UpdateUserAvatarCommand,
  RemoveUserAvatarCommand,
  UpdateAvatarResult,
  UpdateNotificationSettingsCommand,
} from '../../../core/application/user/commands';
import {
  GetUserQuery,
  ListUsersQuery,
  GetNotificationSettingsQuery,
} from '../../../core/application/user/queries';

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
      new ListUsersQuery(query.page, query.limit),
    );
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USER.READ)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return await this.queryBus.execute(new GetUserQuery(id));
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.USER.UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
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
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
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
}
