import { Controller, Get, Post, Body, Query, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import {
  DepositDto,
  WithdrawDto,
  WalletResponseDto,
  BalanceResponseDto,
  TransactionListResponseDto,
  DepositResponseDto,
  WithdrawResponseDto,
  ListTransactionsQueryDto,
} from '../dto/wallet';
import {
  CreateWalletCommand,
  DepositCommand,
  WithdrawCommand,
} from '../../../core/application/wallet/commands';
import {
  GetWalletQuery,
  GetBalanceQuery,
  ListTransactionsQuery,
} from '../../../core/application/wallet/queries';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('me')
  async createMyWallet(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WalletResponseDto> {
    const result = await this.commandBus.execute(
      new CreateWalletCommand(user.id),
    );
    return {
      id: result.id,
      userId: result.userId,
      balance: result.balance,
      currency: result.currency,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  @Get('me')
  async getMyWallet(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WalletResponseDto> {
    return await this.queryBus.execute(new GetWalletQuery(user.id));
  }

  @Get('me/balance')
  async getMyBalance(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BalanceResponseDto> {
    return await this.queryBus.execute(new GetBalanceQuery(user.id));
  }

  @Get('me/transactions')
  async getMyTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListTransactionsQueryDto,
  ): Promise<TransactionListResponseDto> {
    return await this.queryBus.execute(
      new ListTransactionsQuery(user.id, query.page, query.limit),
    );
  }

  @Post('me/deposit')
  @HttpCode(200)
  async deposit(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: DepositDto,
  ): Promise<DepositResponseDto> {
    return await this.commandBus.execute(
      new DepositCommand(user.id, dto.amount, dto.description || 'Deposit'),
    );
  }

  @Post('me/withdraw')
  @HttpCode(200)
  async withdraw(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: WithdrawDto,
  ): Promise<WithdrawResponseDto> {
    return await this.commandBus.execute(
      new WithdrawCommand(user.id, dto.amount, dto.description || 'Withdrawal'),
    );
  }
}
