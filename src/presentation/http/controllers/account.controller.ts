import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import {
  RegisterAccountDto,
  RegisterAccountResponseDto,
  AccountResponseDto,
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

@Controller('accounts')
export class AccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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
