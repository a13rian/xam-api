import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ToggleServiceCommand } from './toggle-service.command';
import {
  SERVICE_REPOSITORY,
  IServiceRepository,
} from '../../../../domain/service/repositories/service.repository.interface';

@CommandHandler(ToggleServiceCommand)
export class ToggleServiceHandler implements ICommandHandler<ToggleServiceCommand> {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(command: ToggleServiceCommand): Promise<void> {
    const service = await this.serviceRepository.findById(command.id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Verify ownership
    if (service.partnerId !== command.partnerId) {
      throw new ForbiddenException('You do not own this service');
    }

    if (command.isActive) {
      service.activate();
    } else {
      service.deactivate();
    }

    await this.serviceRepository.save(service);
  }
}
