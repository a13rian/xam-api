import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Public } from '../../../shared/decorators/public.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import {
  CreateServiceDto,
  UpdateServiceDto,
  ListServicesQueryDto,
  ServiceResponseDto,
  ServicesListResponseDto,
  ToggleServiceDto,
} from '../dto/service';
import {
  CreateServiceCommand,
  UpdateServiceCommand,
  DeleteServiceCommand,
  ToggleServiceCommand,
} from '../../../core/application/service/commands';
import {
  GetServiceQuery,
  ListServicesQuery,
  ListPartnerServicesQuery,
} from '../../../core/application/service/queries';
import { GetMyPartnerQuery } from '../../../core/application/partner/queries';

@Controller('services')
export class ServiceController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @Public()
  async search(
    @Query() query: ListServicesQueryDto,
  ): Promise<ServicesListResponseDto> {
    return await this.queryBus.execute(
      new ListServicesQuery(
        query.partnerId,
        query.categoryId,
        query.isActive ?? true,
        query.search,
        query.page,
        query.limit,
      ),
    );
  }

  @Get(':id')
  @Public()
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ServiceResponseDto> {
    return await this.queryBus.execute(new GetServiceQuery(id));
  }
}

@Controller('partners/me/services')
export class PartnerServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  private async getPartnerId(userId: string): Promise<string> {
    const partner = await this.queryBus.execute(new GetMyPartnerQuery(userId));
    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }
    return partner.id;
  }

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ items: ServiceResponseDto[]; total: number }> {
    const partnerId = await this.getPartnerId(user.id);
    return await this.queryBus.execute(
      new ListPartnerServicesQuery(partnerId, true),
    );
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    const partnerId = await this.getPartnerId(user.id);

    const result = await this.commandBus.execute(
      new CreateServiceCommand(
        partnerId,
        dto.categoryId,
        dto.name,
        dto.price,
        dto.durationMinutes,
        dto.bookingType,
        dto.description,
        dto.currency,
        dto.sortOrder,
      ),
    );

    return await this.queryBus.execute(new GetServiceQuery(result.id));
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    const partnerId = await this.getPartnerId(user.id);

    await this.commandBus.execute(
      new UpdateServiceCommand(
        id,
        partnerId,
        dto.name,
        dto.description,
        dto.categoryId,
        dto.price,
        dto.currency,
        dto.durationMinutes,
        dto.sortOrder,
      ),
    );

    return await this.queryBus.execute(new GetServiceQuery(id));
  }

  @Post(':id/toggle')
  async toggle(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleServiceDto,
  ): Promise<ServiceResponseDto> {
    const partnerId = await this.getPartnerId(user.id);

    await this.commandBus.execute(
      new ToggleServiceCommand(id, partnerId, dto.isActive),
    );

    return await this.queryBus.execute(new GetServiceQuery(id));
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const partnerId = await this.getPartnerId(user.id);
    await this.commandBus.execute(new DeleteServiceCommand(id, partnerId));
  }
}
