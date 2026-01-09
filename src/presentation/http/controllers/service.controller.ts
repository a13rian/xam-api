import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { GetMyAccountQuery } from '../../../core/application/account/queries';
import { AccountResponseDto } from '../dto/account';

@Controller('services')
export class ServiceController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @Public()
  async search(
    @Query() query: ListServicesQueryDto,
  ): Promise<ServicesListResponseDto> {
    return await this.queryBus.execute<
      ListServicesQuery,
      ServicesListResponseDto
    >(
      new ListServicesQuery(
        query.organizationId,
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
  async getById(@Param('id') id: string): Promise<ServiceResponseDto> {
    return await this.queryBus.execute<GetServiceQuery, ServiceResponseDto>(
      new GetServiceQuery(id),
    );
  }
}

@Controller('partners/me/services')
export class PartnerServiceController {
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
  ): Promise<{ items: ServiceResponseDto[]; total: number }> {
    const organizationId = await this.getOrganizationId(user.id);
    return await this.queryBus.execute<
      ListPartnerServicesQuery,
      { items: ServiceResponseDto[]; total: number }
    >(new ListPartnerServicesQuery(organizationId, true));
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    const organizationId = await this.getOrganizationId(user.id);

    const result = await this.commandBus.execute<
      CreateServiceCommand,
      { id: string }
    >(
      new CreateServiceCommand(
        organizationId,
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

    return await this.queryBus.execute<GetServiceQuery, ServiceResponseDto>(
      new GetServiceQuery(result.id),
    );
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    const organizationId = await this.getOrganizationId(user.id);

    await this.commandBus.execute(
      new UpdateServiceCommand(
        id,
        organizationId,
        dto.name,
        dto.description,
        dto.categoryId,
        dto.price,
        dto.currency,
        dto.durationMinutes,
        dto.sortOrder,
      ),
    );

    return await this.queryBus.execute<GetServiceQuery, ServiceResponseDto>(
      new GetServiceQuery(id),
    );
  }

  @Post(':id/toggle')
  async toggle(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ToggleServiceDto,
  ): Promise<ServiceResponseDto> {
    const organizationId = await this.getOrganizationId(user.id);

    await this.commandBus.execute(
      new ToggleServiceCommand(id, organizationId, dto.isActive),
    );

    return await this.queryBus.execute(new GetServiceQuery(id));
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    const organizationId = await this.getOrganizationId(user.id);
    await this.commandBus.execute(new DeleteServiceCommand(id, organizationId));
  }
}
