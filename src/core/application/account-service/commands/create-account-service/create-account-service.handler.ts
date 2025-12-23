import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateAccountServiceCommand } from './create-account-service.command';
import { AccountService } from '../../../../domain/account-service/entities/account-service.entity';
import {
  ACCOUNT_SERVICE_REPOSITORY,
  IAccountServiceRepository,
} from '../../../../domain/account-service/repositories/account-service.repository.interface';
import {
  SERVICE_CATEGORY_REPOSITORY,
  IServiceCategoryRepository,
} from '../../../../domain/service/repositories/service-category.repository.interface';
import {
  ACCOUNT_REPOSITORY,
  IAccountRepository,
} from '../../../../domain/account/repositories/account.repository.interface';

@CommandHandler(CreateAccountServiceCommand)
export class CreateAccountServiceHandler implements ICommandHandler<CreateAccountServiceCommand> {
  constructor(
    @Inject(ACCOUNT_SERVICE_REPOSITORY)
    private readonly accountServiceRepository: IAccountServiceRepository,
    @Inject(SERVICE_CATEGORY_REPOSITORY)
    private readonly categoryRepository: IServiceCategoryRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(command: CreateAccountServiceCommand): Promise<{ id: string }> {
    const account = await this.accountRepository.findById(command.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    if (!account.canOperate()) {
      throw new ForbiddenException('Account is not active or approved');
    }

    const category = await this.categoryRepository.findById(command.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const exists = await this.accountServiceRepository.existsByAccountIdAndName(
      command.accountId,
      command.name,
    );
    if (exists) {
      throw new ConflictException(
        'Service with this name already exists for this account',
      );
    }

    const service = AccountService.create({
      accountId: command.accountId,
      categoryId: command.categoryId,
      name: command.name,
      description: command.description,
      price: command.price,
      currency: command.currency,
      durationMinutes: command.durationMinutes,
      sortOrder: command.sortOrder,
    });

    await this.accountServiceRepository.save(service);

    return { id: service.id };
  }
}
