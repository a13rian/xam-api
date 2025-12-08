import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DepositCommand } from './deposit.command';
import {
  IWalletRepository,
  WALLET_REPOSITORY,
} from '../../../../domain/wallet/repositories/wallet.repository.interface';
import {
  IWalletTransactionRepository,
  WALLET_TRANSACTION_REPOSITORY,
} from '../../../../domain/wallet/repositories/wallet-transaction.repository.interface';
import { Money } from '../../../../domain/shared/value-objects/money.vo';

export interface DepositResult {
  transactionId: string;
  walletId: string;
  amount: number;
  balance: number;
  currency: string;
}

@CommandHandler(DepositCommand)
export class DepositHandler implements ICommandHandler<DepositCommand> {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(WALLET_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: IWalletTransactionRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DepositCommand): Promise<DepositResult> {
    const wallet = await this.walletRepository.findByUserId(command.userId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const walletWithContext = this.eventPublisher.mergeObjectContext(wallet);
    const amount = Money.create(command.amount, wallet.balance.currency);

    const transaction = walletWithContext.deposit(amount, command.description);

    await this.walletRepository.save(walletWithContext);
    await this.transactionRepository.save(transaction);
    walletWithContext.commit();

    return {
      transactionId: transaction.id,
      walletId: wallet.id,
      amount: transaction.amount.amount,
      balance: transaction.balanceAfter.amount,
      currency: transaction.amount.currency,
    };
  }
}
