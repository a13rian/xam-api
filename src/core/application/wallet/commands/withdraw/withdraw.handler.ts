import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { WithdrawCommand } from './withdraw.command';
import {
  IWalletRepository,
  WALLET_REPOSITORY,
} from '../../../../domain/wallet/repositories/wallet.repository.interface';
import {
  IWalletTransactionRepository,
  WALLET_TRANSACTION_REPOSITORY,
} from '../../../../domain/wallet/repositories/wallet-transaction.repository.interface';
import { Money } from '../../../../domain/shared/value-objects/money.vo';

export interface WithdrawResult {
  transactionId: string;
  walletId: string;
  amount: number;
  balanceAfter: number;
  currency: string;
}

@CommandHandler(WithdrawCommand)
export class WithdrawHandler implements ICommandHandler<WithdrawCommand> {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(WALLET_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: IWalletTransactionRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: WithdrawCommand): Promise<WithdrawResult> {
    const wallet = await this.walletRepository.findByUserId(command.userId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const walletWithContext = this.eventPublisher.mergeObjectContext(wallet);
    const amount = Money.create(command.amount, wallet.balance.currency);

    if (!wallet.hasSufficientBalance(amount)) {
      throw new BadRequestException('Insufficient balance');
    }

    const transaction = walletWithContext.withdraw(amount, command.description);

    await this.walletRepository.save(walletWithContext);
    await this.transactionRepository.save(transaction);
    walletWithContext.commit();

    return {
      transactionId: transaction.id,
      walletId: wallet.id,
      amount: transaction.amount.amount,
      balanceAfter: transaction.balanceAfter.amount,
      currency: transaction.amount.currency,
    };
  }
}
