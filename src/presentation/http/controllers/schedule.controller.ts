import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Public } from '../../../shared/decorators/public.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import {
  GenerateSlotsDto,
  GetSlotsQueryDto,
  GetSlotsByRangeQueryDto,
  TimeSlotResponseDto,
} from '../dto/schedule';
import {
  GenerateSlotsCommand,
  BlockSlotCommand,
  UnblockSlotCommand,
} from '../../../core/application/schedule/commands';
import {
  GetAvailableSlotsQuery,
  GetSlotsByDateRangeQuery,
} from '../../../core/application/schedule/queries';
import { GetMyAccountQuery } from '../../../core/application/account/queries';
import { AccountResponseDto } from '../dto/account';

@Controller('locations/:locationId/slots')
export class ScheduleController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('available')
  @Public()
  async getAvailable(
    @Param('locationId') locationId: string,
    @Query() query: GetSlotsQueryDto,
  ): Promise<{ items: TimeSlotResponseDto[] }> {
    return await this.queryBus.execute<
      GetAvailableSlotsQuery,
      { items: TimeSlotResponseDto[] }
    >(new GetAvailableSlotsQuery(locationId, new Date(query.date)));
  }
}

@Controller('partners/me/locations/:locationId/slots')
export class PartnerScheduleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  private async getOrganizationId(userId: string): Promise<string> {
    const account = await this.queryBus.execute<
      GetMyAccountQuery,
      AccountResponseDto | null
    >(new GetMyAccountQuery(userId));
    if (!account || !account.organization?.id) {
      throw new NotFoundException('Organization not found');
    }
    return account.organization.id;
  }

  @Get()
  async getSlots(
    @CurrentUser() user: AuthenticatedUser,
    @Param('locationId') locationId: string,
    @Query() query: GetSlotsByRangeQueryDto,
  ): Promise<{ items: TimeSlotResponseDto[] }> {
    await this.getOrganizationId(user.id); // Verify organization

    return await this.queryBus.execute(
      new GetSlotsByDateRangeQuery(
        locationId,
        new Date(query.startDate),
        new Date(query.endDate),
      ),
    );
  }

  @Post('generate')
  async generateSlots(
    @CurrentUser() user: AuthenticatedUser,
    @Param('locationId') locationId: string,
    @Body() dto: GenerateSlotsDto,
  ): Promise<{ count: number }> {
    const organizationId = await this.getOrganizationId(user.id);

    return await this.commandBus.execute(
      new GenerateSlotsCommand(
        locationId,
        organizationId,
        new Date(dto.startDate),
        new Date(dto.endDate),
        dto.slotDurationMinutes,
        dto.staffId,
      ),
    );
  }

  @Post(':slotId/block')
  async blockSlot(
    @CurrentUser() user: AuthenticatedUser,
    @Param('slotId') slotId: string,
  ): Promise<void> {
    const organizationId = await this.getOrganizationId(user.id);
    await this.commandBus.execute(new BlockSlotCommand(slotId, organizationId));
  }

  @Post(':slotId/unblock')
  async unblockSlot(
    @CurrentUser() user: AuthenticatedUser,
    @Param('slotId') slotId: string,
  ): Promise<void> {
    const organizationId = await this.getOrganizationId(user.id);
    await this.commandBus.execute(
      new UnblockSlotCommand(slotId, organizationId),
    );
  }
}
