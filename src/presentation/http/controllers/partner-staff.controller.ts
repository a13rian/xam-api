import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import {
  InviteStaffDto,
  AcceptInvitationDto,
  ChangeRoleDto,
  StaffResponseDto,
  InviteStaffResponseDto,
} from '../dto/partner-staff';
import {
  InviteStaffCommand,
  AcceptInvitationCommand,
  RemoveStaffCommand,
  ChangeStaffRoleCommand,
} from '../../../core/application/partner-staff/commands';
import {
  ListStaffQuery,
  GetStaffByUserIdQuery,
} from '../../../core/application/partner-staff/queries';
import { GetMyPartnerQuery } from '../../../core/application/partner/queries';
import { PartnerResponseDto } from '../dto/partner';

@Controller('partners/me/staff')
export class PartnerStaffController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  private async getPartnerIdForStaff(userId: string): Promise<string> {
    // First try to get partner if user is an owner
    const partner = await this.queryBus.execute<
      GetMyPartnerQuery,
      PartnerResponseDto | null
    >(new GetMyPartnerQuery(userId));
    if (partner) {
      return partner.id;
    }

    // Otherwise, check if user is a staff member
    const memberships = await this.queryBus.execute<
      GetStaffByUserIdQuery,
      { items: StaffResponseDto[] }
    >(new GetStaffByUserIdQuery(userId));
    if (memberships.items.length > 0) {
      return memberships.items[0].partnerId;
    }

    throw new NotFoundException('Partner profile not found');
  }

  @Get()
  async listStaff(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ items: StaffResponseDto[] }> {
    const partnerId = await this.getPartnerIdForStaff(user.id);
    return await this.queryBus.execute(new ListStaffQuery(partnerId, user.id));
  }

  @Post('invite')
  async inviteStaff(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InviteStaffDto,
  ): Promise<InviteStaffResponseDto> {
    const partnerId = await this.getPartnerIdForStaff(user.id);
    return await this.commandBus.execute(
      new InviteStaffCommand(partnerId, user.id, dto.email, dto.role),
    );
  }

  @Patch(':staffId/role')
  async changeRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Body() dto: ChangeRoleDto,
  ): Promise<void> {
    const partnerId = await this.getPartnerIdForStaff(user.id);
    await this.commandBus.execute(
      new ChangeStaffRoleCommand(staffId, partnerId, user.id, dto.role),
    );
  }

  @Delete(':staffId')
  async removeStaff(
    @CurrentUser() user: AuthenticatedUser,
    @Param('staffId', ParseUUIDPipe) staffId: string,
  ): Promise<void> {
    const partnerId = await this.getPartnerIdForStaff(user.id);
    await this.commandBus.execute(
      new RemoveStaffCommand(staffId, partnerId, user.id),
    );
  }
}

@Controller('staff-invitations')
export class StaffInvitationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('accept')
  @HttpCode(200)
  async acceptInvitation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AcceptInvitationDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new AcceptInvitationCommand(dto.token, user.id),
    );
  }

  @Get('my-memberships')
  async getMyMemberships(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ items: StaffResponseDto[] }> {
    return await this.queryBus.execute(new GetStaffByUserIdQuery(user.id));
  }
}
