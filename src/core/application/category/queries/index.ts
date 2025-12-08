export * from './get-category/get-category.query';
export * from './get-category/get-category.handler';
export * from './list-categories/list-categories.query';
export * from './list-categories/list-categories.handler';

import { GetCategoryHandler } from './get-category/get-category.handler';
import { ListCategoriesHandler } from './list-categories/list-categories.handler';

export const CategoryQueryHandlers = [
  GetCategoryHandler,
  ListCategoriesHandler,
];
