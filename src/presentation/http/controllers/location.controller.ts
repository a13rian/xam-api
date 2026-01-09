import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Public } from '../../../shared/decorators/public.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import {
  CreateLocationDto,
  UpdateLocationDto,
  SetOperatingHoursDto,
  LocationResponseDto,
  OperatingHoursResponseDto,
} from '../dto/location';
import {
  CreateLocationCommand,
  UpdateLocationCommand,
  DeleteLocationCommand,
  SetPrimaryLocationCommand,
  SetOperatingHoursCommand,
} from '../../../core/application/location/commands';
import {
  GetLocationQuery,
  ListPartnerLocationsQuery,
  GetOperatingHoursQuery,
} from '../../../core/application/location/queries';
import { GetMyAccountQuery } from '../../../core/application/account/queries';
import { AccountResponseDto } from '../dto/account';

@Controller('locations')
export class LocationController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  @Public()
  async getById(@Param('id') id: string): Promise<LocationResponseDto> {
    return await this.queryBus.execute<GetLocationQuery, LocationResponseDto>(
      new GetLocationQuery(id),
    );
  }

  @Get(':id/hours')
  @Public()
  async getOperatingHours(
    @Param('id') id: string,
  ): Promise<{ items: OperatingHoursResponseDto[] }> {
    return await this.queryBus.execute<
      GetOperatingHoursQuery,
      { items: OperatingHoursResponseDto[] }
    >(new GetOperatingHoursQuery(id));
  }
}

@Controller('partners/me/locations')
export class PartnerLocationController {
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
  async list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ items: LocationResponseDto[]; total: number }> {
    const organizationId = await this.getOrganizationId(user.id);
    return await this.queryBus.execute<
      ListPartnerLocationsQuery,
      { items: LocationResponseDto[]; total: number }
    >(new ListPartnerLocationsQuery(organizationId));
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateLocationDto,
  ): Promise<LocationResponseDto> {
    const organizationId = await this.getOrganizationId(user.id);

    const result = await this.commandBus.execute<
      CreateLocationCommand,
      { id: string }
    >(
      new CreateLocationCommand(
        organizationId,
        dto.name,
        dto.street,
        dto.district,
        dto.city,
        dto.ward,
        dto.latitude,
        dto.longitude,
        dto.phone,
        dto.isPrimary,
      ),
    );

    return await this.queryBus.execute<GetLocationQuery, LocationResponseDto>(
      new GetLocationQuery(result.id),
    );
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ): Promise<LocationResponseDto> {
    const organizationId = await this.getOrganizationId(user.id);

    await this.commandBus.execute(
      new UpdateLocationCommand(
        id,
        organizationId,
        dto.name,
        dto.street,
        dto.ward,
        dto.district,
        dto.city,
        dto.latitude,
        dto.longitude,
        dto.phone,
      ),
    );

    return await this.queryBus.execute(new GetLocationQuery(id));
  }

  @Post(':id/primary')
  async setPrimary(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<LocationResponseDto> {
    const organizationId = await this.getOrganizationId(user.id);

    await this.commandBus.execute(
      new SetPrimaryLocationCommand(id, organizationId),
    );

    return await this.queryBus.execute(new GetLocationQuery(id));
  }

  @Put(':id/hours')
  async setOperatingHours(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: SetOperatingHoursDto,
  ): Promise<{ items: OperatingHoursResponseDto[] }> {
    const organizationId = await this.getOrganizationId(user.id);

    await this.commandBus.execute(
      new SetOperatingHoursCommand(id, organizationId, dto.hours),
    );

    return await this.queryBus.execute(new GetOperatingHoursQuery(id));
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    const organizationId = await this.getOrganizationId(user.id);
    await this.commandBus.execute(
      new DeleteLocationCommand(id, organizationId),
    );
  }
}
