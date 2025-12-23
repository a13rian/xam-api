import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteAccountServiceCommand } from './delete-account-service.command';
import {
  ACCOUNT_SERVICE_REPOSITORY,
  IAccountServiceRepository,
} from '../../../../domain/account-service/repositories/account-service.repository.interface';

@CommandHandler(DeleteAccountServiceCommand)
export class DeleteAccountServiceHandler implements ICommandHandler<DeleteAccountServiceCommand> {
  constructor(
    @Inject(ACCOUNT_SERVICE_REPOSITORY)
    private readonly accountServiceRepository: IAccountServiceRepository,
  ) {}

  async execute(command: DeleteAccountServiceCommand): Promise<void> {
    const service = await this.accountServiceRepository.findById(command.id);
    if (!service) {
      throw new NotFoundException('Account service not found');
    }

    if (service.accountId !== command.accountId) {
      throw new ForbiddenException('Not authorized to delete this service');
    }

    await this.accountServiceRepository.delete(command.id);
  }
}
