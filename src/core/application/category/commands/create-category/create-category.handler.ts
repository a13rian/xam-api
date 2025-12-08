import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateCategoryCommand } from './create-category.command';
import { ServiceCategory } from '../../../../domain/service/entities/service-category.entity';
import {
  SERVICE_CATEGORY_REPOSITORY,
  IServiceCategoryRepository,
} from '../../../../domain/service/repositories/service-category.repository.interface';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(
    @Inject(SERVICE_CATEGORY_REPOSITORY)
    private readonly categoryRepository: IServiceCategoryRepository,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<{ id: string }> {
    const slugExists = await this.categoryRepository.existsBySlug(command.slug);
    if (slugExists) {
      throw new ConflictException('Category with this slug already exists');
    }

    if (command.parentId) {
      const parent = await this.categoryRepository.findById(command.parentId);
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = ServiceCategory.create({
      id: uuidv4(),
      name: command.name,
      slug: command.slug,
      description: command.description,
      parentId: command.parentId,
      iconUrl: command.iconUrl,
      sortOrder: command.sortOrder,
    });

    await this.categoryRepository.save(category);

    return { id: category.id };
  }
}
