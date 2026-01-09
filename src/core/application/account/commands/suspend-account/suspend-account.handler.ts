import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { SuspendAccountCommand } from './suspend-account.command';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';

@CommandHandler(SuspendAccountCommand)
export class SuspendAccountHandler implements ICommandHandler<SuspendAccountCommand> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(command: SuspendAccountCommand): Promise<void> {
    const account = await this.accountRepository.findById(command.accountId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    account.suspend(command.reason);
    await this.accountRepository.save(account);
  }
}
