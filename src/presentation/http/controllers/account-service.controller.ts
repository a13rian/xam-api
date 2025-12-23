import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Public } from '../../../shared/decorators/public.decorator';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import {
  CreateAccountServiceDto,
  UpdateAccountServiceDto,
  ToggleAccountServiceDto,
  ListAccountServicesQueryDto,
  AccountServiceResponseDto,
  AccountServicesListResponseDto,
} from '../dto/account-service';
import {
  CreateAccountServiceCommand,
  UpdateAccountServiceCommand,
  ToggleAccountServiceCommand,
  DeleteAccountServiceCommand,
} from '../../../core/application/account-service/commands';
import {
  GetAccountServiceQuery,
  ListAccountServicesQuery,
} from '../../../core/application/account-service/queries';
import {
  GetMyAccountQuery,
  GetMyAccountResult,
} from '../../../core/application/account/queries/get-my-account';

@ApiTags('account-services')
@Controller('accounts/me/services')
export class AccountServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  private async getMyAccountId(userId: string): Promise<string> {
    const result = await this.queryBus.execute<
      GetMyAccountQuery,
      GetMyAccountResult
    >(new GetMyAccountQuery(userId));
    return result.id;
  }

  @Get()
  @ApiOperation({ summary: 'List my account services' })
  async listMyServices(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListAccountServicesQueryDto,
  ): Promise<AccountServicesListResponseDto> {
    const accountId = await this.getMyAccountId(user.id);

    return this.queryBus.execute(
      new ListAccountServicesQuery(
        accountId,
        query.isActive,
        query.categoryId,
        query.search,
        query.page,
        query.limit,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get my account service by ID' })
  async getMyService(
    @Param('id') id: string,
  ): Promise<AccountServiceResponseDto> {
    return this.queryBus.execute(new GetAccountServiceQuery(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account service' })
  async createService(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAccountServiceDto,
  ): Promise<AccountServiceResponseDto> {
    const accountId = await this.getMyAccountId(user.id);

    const result = await this.commandBus.execute<
      CreateAccountServiceCommand,
      { id: string }
    >(
      new CreateAccountServiceCommand(
        accountId,
        dto.categoryId,
        dto.name,
        dto.price,
        dto.durationMinutes,
        dto.description,
        dto.currency,
        dto.sortOrder,
      ),
    );

    return this.queryBus.execute(new GetAccountServiceQuery(result.id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an account service' })
  async updateService(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateAccountServiceDto,
  ): Promise<AccountServiceResponseDto> {
    const accountId = await this.getMyAccountId(user.id);

    await this.commandBus.execute(
      new UpdateAccountServiceCommand(
        id,
        accountId,
        dto.name,
        dto.description,
        dto.categoryId,
        dto.price,
        dto.currency,
        dto.durationMinutes,
        dto.sortOrder,
      ),
    );

    return this.queryBus.execute(new GetAccountServiceQuery(id));
  }

  @Post(':id/toggle')
  @ApiOperation({ summary: 'Toggle account service active status' })
  async toggleService(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ToggleAccountServiceDto,
  ): Promise<AccountServiceResponseDto> {
    const accountId = await this.getMyAccountId(user.id);

    await this.commandBus.execute(
      new ToggleAccountServiceCommand(id, accountId, dto.isActive),
    );

    return this.queryBus.execute(new GetAccountServiceQuery(id));
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an account service' })
  async deleteService(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    const accountId = await this.getMyAccountId(user.id);
    await this.commandBus.execute(
      new DeleteAccountServiceCommand(id, accountId),
    );
  }
}

@ApiTags('accounts')
@Controller('accounts/:accountId/services')
export class PublicAccountServiceController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get public services for an account' })
  async getAccountServices(
    @Param('accountId') accountId: string,
    @Query() query: ListAccountServicesQueryDto,
  ): Promise<AccountServicesListResponseDto> {
    return this.queryBus.execute(
      new ListAccountServicesQuery(
        accountId,
        true,
        query.categoryId,
        query.search,
        query.page,
        query.limit,
      ),
    );
  }
}
