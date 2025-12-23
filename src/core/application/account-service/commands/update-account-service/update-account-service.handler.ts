import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { UpdateAccountServiceCommand } from './update-account-service.command';
import {
  ACCOUNT_SERVICE_REPOSITORY,
  IAccountServiceRepository,
} from '../../../../domain/account-service/repositories/account-service.repository.interface';
import {
  SERVICE_CATEGORY_REPOSITORY,
  IServiceCategoryRepository,
} from '../../../../domain/service/repositories/service-category.repository.interface';

@CommandHandler(UpdateAccountServiceCommand)
export class UpdateAccountServiceHandler implements ICommandHandler<UpdateAccountServiceCommand> {
  constructor(
    @Inject(ACCOUNT_SERVICE_REPOSITORY)
    private readonly accountServiceRepository: IAccountServiceRepository,
    @Inject(SERVICE_CATEGORY_REPOSITORY)
    private readonly categoryRepository: IServiceCategoryRepository,
  ) {}

  async execute(command: UpdateAccountServiceCommand): Promise<void> {
    const service = await this.accountServiceRepository.findById(command.id);
    if (!service) {
      throw new NotFoundException('Account service not found');
    }

    if (service.accountId !== command.accountId) {
      throw new ForbiddenException('Not authorized to update this service');
    }

    if (command.categoryId && command.categoryId !== service.categoryId) {
      const category = await this.categoryRepository.findById(
        command.categoryId,
      );
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    if (command.name && command.name !== service.name) {
      const exists =
        await this.accountServiceRepository.existsByAccountIdAndName(
          command.accountId,
          command.name,
          command.id,
        );
      if (exists) {
        throw new ConflictException('Service with this name already exists');
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

    await this.accountServiceRepository.save(service);
  }
}
