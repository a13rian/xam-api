import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ToggleAccountServiceCommand } from './toggle-account-service.command';
import {
  ACCOUNT_SERVICE_REPOSITORY,
  IAccountServiceRepository,
} from '../../../../domain/account-service/repositories/account-service.repository.interface';

@CommandHandler(ToggleAccountServiceCommand)
export class ToggleAccountServiceHandler implements ICommandHandler<ToggleAccountServiceCommand> {
  constructor(
    @Inject(ACCOUNT_SERVICE_REPOSITORY)
    private readonly accountServiceRepository: IAccountServiceRepository,
  ) {}

  async execute(command: ToggleAccountServiceCommand): Promise<void> {
    const service = await this.accountServiceRepository.findById(command.id);
    if (!service) {
      throw new NotFoundException('Account service not found');
    }

    if (service.accountId !== command.accountId) {
      throw new ForbiddenException('Not authorized to modify this service');
    }

    if (command.isActive) {
      service.activate();
    } else {
      service.deactivate();
    }

    await this.accountServiceRepository.save(service);
  }
}
