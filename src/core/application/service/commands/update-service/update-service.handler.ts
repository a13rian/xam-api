import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateServiceCommand } from './update-service.command';
import {
  SERVICE_REPOSITORY,
  IServiceRepository,
} from '../../../../domain/service/repositories/service.repository.interface';
import {
  SERVICE_CATEGORY_REPOSITORY,
  IServiceCategoryRepository,
} from '../../../../domain/service/repositories/service-category.repository.interface';

@CommandHandler(UpdateServiceCommand)
export class UpdateServiceHandler implements ICommandHandler<UpdateServiceCommand> {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(SERVICE_CATEGORY_REPOSITORY)
    private readonly categoryRepository: IServiceCategoryRepository,
  ) {}

  async execute(command: UpdateServiceCommand): Promise<void> {
    const service = await this.serviceRepository.findById(command.id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Verify ownership - return 404 to not reveal resource existence
    if (service.organizationId !== command.organizationId) {
      throw new NotFoundException('Service not found');
    }

    // Check for duplicate name if updating
    if (command.name) {
      const exists = await this.serviceRepository.existsByOrganizationIdAndName(
        command.organizationId,
        command.name,
        command.id,
      );
      if (exists) {
        throw new ConflictException(
          'Service with this name already exists for this organization',
        );
      }
    }

    // Verify new category if provided
    if (command.categoryId) {
      const category = await this.categoryRepository.findById(
        command.categoryId,
      );
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    service.update({
      name: command.name,
      description: command.description,
      categoryId: command.categoryId,
      sortOrder: command.sortOrder,
    });

    if (command.price !== undefined || command.durationMinutes !== undefined) {
      service.updatePricing({
        price: command.price,
        currency: command.currency,
        durationMinutes: command.durationMinutes,
      });
    }

    await this.serviceRepository.save(service);
  }
}
