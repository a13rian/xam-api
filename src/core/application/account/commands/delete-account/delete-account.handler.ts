import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteAccountCommand } from './delete-account.command';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';

@CommandHandler(DeleteAccountCommand)
export class DeleteAccountHandler implements ICommandHandler<DeleteAccountCommand> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(command: DeleteAccountCommand): Promise<void> {
    const account = await this.accountRepository.findById(command.accountId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    await this.accountRepository.delete(command.accountId);
  }
}
