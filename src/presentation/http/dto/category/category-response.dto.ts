export class CategoryResponseDto {
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

export class CategoriesListResponseDto {
  items: CategoryResponseDto[];
  total: number;
}
