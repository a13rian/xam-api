import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
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
import { GetMyPartnerQuery } from '../../../core/application/partner/queries';
import { PartnerResponseDto } from '../dto/partner';

@Controller('locations')
export class LocationController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  @Public()
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LocationResponseDto> {
    return await this.queryBus.execute<GetLocationQuery, LocationResponseDto>(
      new GetLocationQuery(id),
    );
  }

  @Get(':id/hours')
  @Public()
  async getOperatingHours(
    @Param('id', ParseUUIDPipe) id: string,
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

  private async getPartnerId(userId: string): Promise<string> {
    const partner = await this.queryBus.execute<
      GetMyPartnerQuery,
      PartnerResponseDto | null
    >(new GetMyPartnerQuery(userId));
    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }
    return partner.id;
  }

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ items: LocationResponseDto[]; total: number }> {
    const partnerId = await this.getPartnerId(user.id);
    return await this.queryBus.execute<
      ListPartnerLocationsQuery,
      { items: LocationResponseDto[]; total: number }
    >(new ListPartnerLocationsQuery(partnerId));
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateLocationDto,
  ): Promise<LocationResponseDto> {
    const partnerId = await this.getPartnerId(user.id);

    const result = await this.commandBus.execute<
      CreateLocationCommand,
      { id: string }
    >(
      new CreateLocationCommand(
        partnerId,
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
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLocationDto,
  ): Promise<LocationResponseDto> {
    const partnerId = await this.getPartnerId(user.id);

    await this.commandBus.execute(
      new UpdateLocationCommand(
        id,
        partnerId,
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
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LocationResponseDto> {
    const partnerId = await this.getPartnerId(user.id);

    await this.commandBus.execute(new SetPrimaryLocationCommand(id, partnerId));

    return await this.queryBus.execute(new GetLocationQuery(id));
  }

  @Put(':id/hours')
  async setOperatingHours(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetOperatingHoursDto,
  ): Promise<{ items: OperatingHoursResponseDto[] }> {
    const partnerId = await this.getPartnerId(user.id);

    await this.commandBus.execute(
      new SetOperatingHoursCommand(id, partnerId, dto.hours),
    );

    return await this.queryBus.execute(new GetOperatingHoursQuery(id));
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const partnerId = await this.getPartnerId(user.id);
    await this.commandBus.execute(new DeleteLocationCommand(id, partnerId));
  }
}
