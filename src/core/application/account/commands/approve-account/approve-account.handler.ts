import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ApproveAccountCommand } from './approve-account.command';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';

@CommandHandler(ApproveAccountCommand)
export class ApproveAccountHandler implements ICommandHandler<ApproveAccountCommand> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ApproveAccountCommand): Promise<void> {
    const account = await this.accountRepository.findById(command.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const accountWithContext = this.eventPublisher.mergeObjectContext(account);
    accountWithContext.approve(command.approvedBy);

    await this.accountRepository.save(accountWithContext);
    accountWithContext.commit();
  }
}
