import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { AdminAdjustBalanceCommand } from './admin-adjust-balance.command';
import {
  IWalletRepository,
  WALLET_REPOSITORY,
} from '../../../../domain/wallet/repositories/wallet.repository.interface';
import {
  IWalletTransactionRepository,
  WALLET_TRANSACTION_REPOSITORY,
} from '../../../../domain/wallet/repositories/wallet-transaction.repository.interface';
import { Money } from '../../../../domain/shared/value-objects/money.vo';

export interface AdminAdjustBalanceResult {
  transactionId: string;
  walletId: string;
  amount: number;
  balanceAfter: number;
  currency: string;
}

@CommandHandler(AdminAdjustBalanceCommand)
export class AdminAdjustBalanceHandler implements ICommandHandler<AdminAdjustBalanceCommand> {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(WALLET_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: IWalletTransactionRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: AdminAdjustBalanceCommand,
  ): Promise<AdminAdjustBalanceResult> {
    const wallet = await this.walletRepository.findById(command.walletId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const walletWithContext = this.eventPublisher.mergeObjectContext(wallet);
    const amount = Money.create(command.amount, wallet.balance.currency);

    const description = `[Admin: ${command.adminId}] ${command.reason}`;
    const transaction = walletWithContext.adjust(amount, description);

    await this.walletRepository.save(walletWithContext);
    await this.transactionRepository.save(transaction);
    walletWithContext.commit();

    return {
      transactionId: transaction.id,
      walletId: wallet.id,
      amount: command.amount,
      balanceAfter: transaction.balanceAfter.amount,
      currency: transaction.amount.currency,
    };
  }
}
