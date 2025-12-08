import { v4 as uuidv4 } from 'uuid';
import { DatabaseHelper } from '../database/database.helper';
import { ServiceCategoryOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/service-category.orm-entity';

export interface CreateCategoryOptions {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  iconUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreatedCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
}

let categoryCounter = 0;

export class CategoryFactory {
  constructor(private readonly db: DatabaseHelper) {}

  async create(options: CreateCategoryOptions = {}): Promise<CreatedCategory> {
    categoryCounter++;
    const categoryRepo = this.db.getRepository(ServiceCategoryOrmEntity);

    const name = options.name ?? `Test Category ${categoryCounter}`;
    const slug =
      options.slug ?? `test-category-${categoryCounter}-${Date.now()}`;

    const category = categoryRepo.create({
      id: uuidv4(),
      name,
      slug,
      description: options.description ?? null,
      parentId: options.parentId ?? null,
      iconUrl: options.iconUrl ?? null,
      sortOrder: options.sortOrder ?? 0,
      isActive: options.isActive ?? true,
    });

    await categoryRepo.save(category);

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
    };
  }

  async createWithParent(
    parentId: string,
    options: CreateCategoryOptions = {},
  ): Promise<CreatedCategory> {
    return this.create({ ...options, parentId });
  }
}
