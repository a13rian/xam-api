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
import { Roles } from '../../../shared/decorators/roles.decorator';
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
import { CreateUserResult } from '../../../core/application/user/commands/create-user/create-user.handler';
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
  @Roles('super_admin', 'admin')
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const result = await this.commandBus.execute(
      new CreateUserCommand(
        dto.email,
        dto.password,
        dto.firstName,
        dto.lastName,
        dto.organizationId,
        dto.roleIds,
      ),
    );

    return await this.queryBus.execute(new GetUserQuery(result.id));
  }

  @Get()
  @Roles('super_admin', 'admin')
  async findAll(
    @Query() query: ListUsersQueryDto,
  ): Promise<UserListResponseDto> {
    return await this.queryBus.execute(
      new ListUsersQuery(query.organizationId, query.page, query.limit),
    );
  }

  @Get(':id')
  @Roles('super_admin', 'admin')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return await this.queryBus.execute(new GetUserQuery(id));
  }

  @Patch(':id')
  @Roles('super_admin', 'admin')
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
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute(new DeleteUserCommand(id));
  }
}
