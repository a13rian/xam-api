import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ActivateAccountCommand } from './activate-account.command';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';

@CommandHandler(ActivateAccountCommand)
export class ActivateAccountHandler implements ICommandHandler<ActivateAccountCommand> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(command: ActivateAccountCommand): Promise<void> {
    const account = await this.accountRepository.findById(command.accountId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    account.reactivate();
    await this.accountRepository.save(account);
  }
}
