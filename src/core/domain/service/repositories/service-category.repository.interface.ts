import { ServiceCategory } from '../entities/service-category.entity';

export const SERVICE_CATEGORY_REPOSITORY = Symbol(
  'SERVICE_CATEGORY_REPOSITORY',
);

export interface IServiceCategoryRepository {
  findById(id: string): Promise<ServiceCategory | null>;
  findBySlug(slug: string): Promise<ServiceCategory | null>;
  findByParentId(parentId: string | null): Promise<ServiceCategory[]>;
  findAll(options?: { includeInactive?: boolean }): Promise<ServiceCategory[]>;
  findRootCategories(options?: {
    includeInactive?: boolean;
  }): Promise<ServiceCategory[]>;
  save(category: ServiceCategory): Promise<void>;
  delete(id: string): Promise<void>;
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
}
