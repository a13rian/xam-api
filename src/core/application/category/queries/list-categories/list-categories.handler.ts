import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListCategoriesQuery } from './list-categories.query';
import {
  SERVICE_CATEGORY_REPOSITORY,
  IServiceCategoryRepository,
} from '../../../../domain/service/repositories/service-category.repository.interface';
import { CategoryResponseDto } from '../get-category/get-category.handler';

export interface CategoriesListResponseDto {
  items: CategoryResponseDto[];
  total: number;
  page: number;
  limit: number;
}

@QueryHandler(ListCategoriesQuery)
export class ListCategoriesHandler implements IQueryHandler<ListCategoriesQuery> {
  constructor(
    @Inject(SERVICE_CATEGORY_REPOSITORY)
    private readonly categoryRepository: IServiceCategoryRepository,
  ) {}

  async execute(
    query: ListCategoriesQuery,
  ): Promise<CategoriesListResponseDto> {
    let categories;

    if (query.parentId === null) {
      // Get root categories only
      categories = await this.categoryRepository.findRootCategories({
        includeInactive: query.includeInactive,
      });
    } else if (query.parentId) {
      // Get children of specific parent
      categories = await this.categoryRepository.findByParentId(query.parentId);
      if (!query.includeInactive) {
        categories = categories.filter((c) => c.isActive);
      }
    } else {
      // Get all categories
      categories = await this.categoryRepository.findAll({
        includeInactive: query.includeInactive,
      });
    }

    const allItems = categories.map((category) => {
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
    });

    const total = allItems.length;
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const items = allItems.slice(startIndex, endIndex);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
    };
  }
}
