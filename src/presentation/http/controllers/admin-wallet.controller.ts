import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import {
  ListAllWalletsQuery,
  ListAllWalletsResult,
  GetWalletQuery,
  ListTransactionsQuery,
} from '../../../core/application/wallet/queries';
import {
  AdminAdjustBalanceCommand,
  AdminAdjustBalanceResult,
} from '../../../core/application/wallet/commands';
import {
  ListAllWalletsQueryDto,
  WalletListResponseDto,
  AdminAdjustBalanceDto,
  AdminAdjustBalanceResponseDto,
} from '../dto/admin/admin-wallet.dto';
import {
  WalletResponseDto,
  TransactionListResponseDto,
  ListTransactionsQueryDto,
} from '../dto/wallet';

@ApiTags('admin/wallets')
@Controller('admin/wallets')
export class AdminWalletController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.WALLET.LIST)
  @ApiOperation({
    summary: 'List all wallets',
    description: 'List all wallets with optional search filter',
  })
  async listAllWallets(
    @Query() query: ListAllWalletsQueryDto,
  ): Promise<WalletListResponseDto> {
    return await this.queryBus.execute<
      ListAllWalletsQuery,
      ListAllWalletsResult
    >(new ListAllWalletsQuery(query.search, query.page, query.limit));
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.WALLET.READ)
  @ApiOperation({
    summary: 'Get wallet by ID',
    description: 'Get wallet details by wallet ID',
  })
  async getWalletById(@Param('id') id: string): Promise<WalletResponseDto> {
    const wallet = await this.queryBus.execute<
      GetWalletQuery,
      WalletResponseDto | null
    >(
      new GetWalletQuery(id, true), // true = findById instead of findByUserId
    );

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  @Get(':id/transactions')
  @RequirePermissions(PERMISSIONS.WALLET.READ)
  @ApiOperation({
    summary: 'Get wallet transactions',
    description: 'Get transaction history for a specific wallet',
  })
  async getWalletTransactions(
    @Param('id') id: string,
    @Query() query: ListTransactionsQueryDto,
  ): Promise<TransactionListResponseDto> {
    return await this.queryBus.execute<
      ListTransactionsQuery,
      TransactionListResponseDto
    >(new ListTransactionsQuery(id, query.page, query.limit, true)); // true = by walletId
  }

  @Post(':id/adjustment')
  @RequirePermissions(PERMISSIONS.WALLET.UPDATE)
  @ApiOperation({
    summary: 'Adjust wallet balance',
    description:
      'Manually adjust wallet balance (positive for credit, negative for debit)',
  })
  async adjustBalance(
    @Param('id') id: string,
    @Body() dto: AdminAdjustBalanceDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AdminAdjustBalanceResponseDto> {
    return await this.commandBus.execute<
      AdminAdjustBalanceCommand,
      AdminAdjustBalanceResult
    >(new AdminAdjustBalanceCommand(id, dto.amount, dto.reason, user.id));
  }
}
