import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteCategoryCommand } from './delete-category.command';
import {
  SERVICE_CATEGORY_REPOSITORY,
  IServiceCategoryRepository,
} from '../../../../domain/service/repositories/service-category.repository.interface';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  constructor(
    @Inject(SERVICE_CATEGORY_REPOSITORY)
    private readonly categoryRepository: IServiceCategoryRepository,
  ) {}

  async execute(command: DeleteCategoryCommand): Promise<void> {
    const category = await this.categoryRepository.findById(command.id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check for child categories
    const children = await this.categoryRepository.findByParentId(command.id);
    if (children.length > 0) {
      // Move children to parent of this category (or root if no parent)
      const newParentId = category.parentId;
      for (const child of children) {
        child.moveTo(newParentId ?? null);
        await this.categoryRepository.save(child);
      }
    }

    await this.categoryRepository.delete(command.id);
  }
}
