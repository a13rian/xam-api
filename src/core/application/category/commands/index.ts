export * from './create-category/create-category.command';
export * from './create-category/create-category.handler';
export * from './update-category/update-category.command';
export * from './update-category/update-category.handler';
export * from './delete-category/delete-category.command';
export * from './delete-category/delete-category.handler';

import { CreateCategoryHandler } from './create-category/create-category.handler';
import { UpdateCategoryHandler } from './update-category/update-category.handler';
import { DeleteCategoryHandler } from './delete-category/delete-category.handler';

export const CategoryCommandHandlers = [
  CreateCategoryHandler,
  UpdateCategoryHandler,
  DeleteCategoryHandler,
];
