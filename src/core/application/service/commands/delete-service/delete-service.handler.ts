import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteServiceCommand } from './delete-service.command';
import {
  SERVICE_REPOSITORY,
  IServiceRepository,
} from '../../../../domain/service/repositories/service.repository.interface';

@CommandHandler(DeleteServiceCommand)
export class DeleteServiceHandler implements ICommandHandler<DeleteServiceCommand> {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(command: DeleteServiceCommand): Promise<void> {
    const service = await this.serviceRepository.findById(command.id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Verify ownership - return 404 to not reveal resource existence
    if (service.partnerId !== command.partnerId) {
      throw new NotFoundException('Service not found');
    }

    await this.serviceRepository.delete(command.id);
  }
}
