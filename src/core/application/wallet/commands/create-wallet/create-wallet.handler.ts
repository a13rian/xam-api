import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { CreateWalletCommand } from './create-wallet.command';
import {
  IWalletRepository,
  WALLET_REPOSITORY,
} from '../../../../domain/wallet/repositories/wallet.repository.interface';
import { Wallet } from '../../../../domain/wallet/entities/wallet.entity';

export interface CreateWalletResult {
  id: string;
  userId: string;
  balance: number;
  currency: string;
}

@CommandHandler(CreateWalletCommand)
export class CreateWalletHandler implements ICommandHandler<CreateWalletCommand> {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateWalletCommand): Promise<CreateWalletResult> {
    const existingWallet = await this.walletRepository.exists(command.userId);
    if (existingWallet) {
      throw new ConflictException('Wallet already exists for this user');
    }

    const wallet = this.eventPublisher.mergeObjectContext(
      Wallet.create(command.userId, command.currency),
    );

    await this.walletRepository.save(wallet);
    wallet.commit();

    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance.amount,
      currency: wallet.balance.currency,
    };
  }
}
