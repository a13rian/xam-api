import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCategoryQuery } from './get-category.query';
import {
  SERVICE_CATEGORY_REPOSITORY,
  IServiceCategoryRepository,
} from '../../../../domain/service/repositories/service-category.repository.interface';

export interface CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  iconUrl?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetCategoryQuery)
export class GetCategoryHandler implements IQueryHandler<GetCategoryQuery> {
  constructor(
    @Inject(SERVICE_CATEGORY_REPOSITORY)
    private readonly categoryRepository: IServiceCategoryRepository,
  ) {}

  async execute(query: GetCategoryQuery): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(query.id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const props = category.toObject();
    return {
      id: props.id,
      name: props.name,
      slug: props.slug,
      description: props.description,
      parentId: props.parentId,
      iconUrl: props.iconUrl,
      sortOrder: props.sortOrder,
      isActive: props.isActive,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
