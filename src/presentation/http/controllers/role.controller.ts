import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateRoleCommand,
  DeleteRoleCommand,
  UpdateRoleCommand,
} from '../../../core/application/role/commands';
import { CreateRoleResult } from '../../../core/application/role/commands/create-role/create-role.handler';
import {
  GetRoleQuery,
  ListPermissionsQuery,
  ListRolesQuery,
} from '../../../core/application/role/queries';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import {
  CreateRoleDto,
  PermissionListResponseDto,
  RoleListResponseDto,
  RoleResponseDto,
  UpdateRoleDto,
} from '../dto/role';

@Controller('roles')
export class RoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions(PERMISSIONS.ROLE.CREATE)
  async create(@Body() dto: CreateRoleDto): Promise<RoleResponseDto> {
    const result = await this.commandBus.execute<
      CreateRoleCommand,
      CreateRoleResult
    >(
      new CreateRoleCommand(
        dto.name,
        dto.description,
        dto.permissionIds,
        dto.organizationId ?? null,
        false,
      ),
    );

    return await this.queryBus.execute(new GetRoleQuery(result.id));
  }

  @Get()
  async findAll(
    @Query('organizationId') organizationId?: string,
    @Query('includeSystemRoles') includeSystemRoles?: string,
  ): Promise<RoleListResponseDto> {
    return await this.queryBus.execute(
      new ListRolesQuery(
        organizationId ?? null,
        includeSystemRoles !== 'false',
      ),
    );
  }

  @Get('permissions')
  async listPermissions(
    @Query('resource') resource?: string,
  ): Promise<PermissionListResponseDto> {
    return await this.queryBus.execute(new ListPermissionsQuery(resource));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RoleResponseDto> {
    return await this.queryBus.execute(new GetRoleQuery(id));
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.ROLE.UPDATE)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    await this.commandBus.execute(
      new UpdateRoleCommand(id, dto.name, dto.description, dto.permissionIds),
    );

    return await this.queryBus.execute(new GetRoleQuery(id));
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.ROLE.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteRoleCommand(id));
  }
}
