import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateCategoryCommand } from './update-category.command';
import {
  SERVICE_CATEGORY_REPOSITORY,
  IServiceCategoryRepository,
} from '../../../../domain/service/repositories/service-category.repository.interface';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  constructor(
    @Inject(SERVICE_CATEGORY_REPOSITORY)
    private readonly categoryRepository: IServiceCategoryRepository,
  ) {}

  async execute(command: UpdateCategoryCommand): Promise<void> {
    const category = await this.categoryRepository.findById(command.id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (command.slug) {
      const slugExists = await this.categoryRepository.existsBySlug(
        command.slug,
        command.id,
      );
      if (slugExists) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    category.update({
      name: command.name,
      slug: command.slug,
      description: command.description,
      iconUrl: command.iconUrl,
      sortOrder: command.sortOrder,
    });

    await this.categoryRepository.save(category);
  }
}
