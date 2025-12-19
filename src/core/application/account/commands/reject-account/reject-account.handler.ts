import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { RejectAccountCommand } from './reject-account.command';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';

@CommandHandler(RejectAccountCommand)
export class RejectAccountHandler implements ICommandHandler<RejectAccountCommand> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RejectAccountCommand): Promise<void> {
    const account = await this.accountRepository.findById(command.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const accountWithContext = this.eventPublisher.mergeObjectContext(account);
    accountWithContext.reject(command.rejectedBy, command.reason);

    await this.accountRepository.save(accountWithContext);
    accountWithContext.commit();
  }
}
