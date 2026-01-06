import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { UserCreatedEvent } from '../../../domain/user/events/user-created.event';
import {
  IWalletRepository,
  WALLET_REPOSITORY,
} from '../../../domain/wallet/repositories/wallet.repository.interface';
import { Wallet } from '../../../domain/wallet/entities/wallet.entity';

const DEFAULT_CURRENCY = 'VND';

@EventsHandler(UserCreatedEvent)
export class UserCreatedWalletHandler implements IEventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedWalletHandler.name);

  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
  ) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    const { userId, email } = event;

    const existingWallet = await this.walletRepository.exists(userId);
    if (existingWallet) {
      this.logger.warn(`Wallet already exists for user ${userId}`);
      return;
    }

    const wallet = Wallet.create(userId, DEFAULT_CURRENCY);
    await this.walletRepository.save(wallet);

    this.logger.log(`Created wallet for user ${email} (${userId})`);
  }
}
