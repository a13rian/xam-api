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
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationResponseDto,
  OrganizationListResponseDto,
  ListOrganizationsQueryDto,
} from '../dto/organization';
import {
  CreateOrganizationCommand,
  UpdateOrganizationCommand,
  DeleteOrganizationCommand,
} from '../../../core/application/organization/commands';
import { CreateOrganizationResult } from '../../../core/application/organization/commands/create-organization/create-organization.handler';
import {
  GetOrganizationQuery,
  ListOrganizationsQuery,
} from '../../../core/application/organization/queries';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationResponseDto> {
    const result = await this.commandBus.execute(
      new CreateOrganizationCommand(
        dto.name,
        dto.slug,
        user.id,
        dto.description,
      ),
    );

    return await this.queryBus.execute(new GetOrganizationQuery(result.id));
  }

  @Get()
  @Roles('super_admin')
  async findAll(
    @Query() query: ListOrganizationsQueryDto,
  ): Promise<OrganizationListResponseDto> {
    return await this.queryBus.execute(
      new ListOrganizationsQuery(query.ownerId, query.page, query.limit),
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrganizationResponseDto> {
    return await this.queryBus.execute(new GetOrganizationQuery(id));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    await this.commandBus.execute(
      new UpdateOrganizationCommand(
        id,
        dto.name,
        dto.description,
        dto.isActive,
      ),
    );

    return await this.queryBus.execute(new GetOrganizationQuery(id));
  }

  @Delete(':id')
  @Roles('super_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute(new DeleteOrganizationCommand(id));
  }
}
