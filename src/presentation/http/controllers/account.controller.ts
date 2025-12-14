import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { Public } from '../../../shared/decorators/public.decorator';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import {
  RegisterAccountDto,
  RegisterAccountResponseDto,
  AccountResponseDto,
  SearchAccountsDto,
  SearchAccountsResponseDto,
} from '../dto/account';
import {
  RegisterAccountCommand,
  ApproveAccountCommand,
} from '../../../core/application/account/commands';
import { RegisterAccountResult } from '../../../core/application/account/commands/register-account/register-account.handler';
import {
  GetMyAccountQuery,
  GetMyAccountResult,
} from '../../../core/application/account/queries/get-my-account';
import { SearchAccountsByLocationQuery } from '../../../core/application/account/queries/search-accounts-by-location';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('search')
  @Public()
  @ApiOperation({
    summary: 'Search accounts by location',
    description:
      'Find accounts within a specified radius from given coordinates, sorted by distance',
  })
  async searchByLocation(
    @Query() dto: SearchAccountsDto,
  ): Promise<SearchAccountsResponseDto> {
    return this.queryBus.execute(
      new SearchAccountsByLocationQuery(
        dto.latitude,
        dto.longitude,
        dto.radiusKm ?? 10,
        dto.search,
        dto.city,
        dto.district,
        dto.ward,
        dto.page ?? 1,
        dto.limit ?? 20,
      ),
    );
  }

  @Post('register')
  async register(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterAccountDto,
  ): Promise<RegisterAccountResponseDto> {
    const result = await this.commandBus.execute<
      RegisterAccountCommand,
      RegisterAccountResult
    >(
      new RegisterAccountCommand(
        user.id,
        dto.type,
        dto.displayName,
        // Individual fields
        dto.specialization,
        dto.yearsExperience,
        dto.certifications,
        dto.portfolio,
        dto.personalBio,
        // Business fields
        dto.businessName,
        dto.description,
        dto.taxId,
        dto.businessLicense,
        dto.companySize,
        dto.website,
        dto.socialMedia,
        dto.establishedDate ? new Date(dto.establishedDate) : undefined,
      ),
    );

    return result;
  }

  @Get('me')
  async getMyAccount(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AccountResponseDto> {
    const result = await this.queryBus.execute<
      GetMyAccountQuery,
      GetMyAccountResult
    >(new GetMyAccountQuery(user.id));

    return result as AccountResponseDto;
  }
}

@Controller('admin/accounts')
export class AdminAccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post(':id/approve')
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.PARTNER.APPROVE)
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.commandBus.execute(new ApproveAccountCommand(id, user.id));
  }
}
