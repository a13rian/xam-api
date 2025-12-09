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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserListResponseDto,
  ListUsersQueryDto,
} from '../dto/user';
import {
  CreateUserCommand,
  UpdateUserCommand,
  DeleteUserCommand,
} from '../../../core/application/user/commands';
import {
  GetUserQuery,
  ListUsersQuery,
} from '../../../core/application/user/queries';

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
}
