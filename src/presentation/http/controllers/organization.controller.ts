import { Controller, Get, Post, Param, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import { OrganizationResponseDto } from '../dto/organization';
import { ApproveOrganizationCommand } from '../../../core/application/organization/commands';
import {
  GetMyOrganizationQuery,
  GetMyOrganizationResult,
} from '../../../core/application/organization/queries/get-my-organization';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me')
  async getMyOrganization(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationResponseDto> {
    const result = await this.queryBus.execute<
      GetMyOrganizationQuery,
      GetMyOrganizationResult
    >(new GetMyOrganizationQuery(user.id));

    return result as OrganizationResponseDto;
  }
}

@Controller('admin/organizations')
export class AdminOrganizationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post(':id/approve')
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.PARTNER.APPROVE)
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.commandBus.execute(new ApproveOrganizationCommand(id, user.id));
  }
}
