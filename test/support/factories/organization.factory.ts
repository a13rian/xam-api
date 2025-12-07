import { v4 as uuidv4 } from 'uuid';
import { DatabaseHelper } from '../database/database.helper';
import { OrganizationOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/organization.orm-entity';

export interface CreateOrganizationOptions {
  name?: string;
  slug?: string;
  description?: string;
  ownerId: string;
  isActive?: boolean;
  settings?: Record<string, unknown>;
}

let orgCounter = 0;

export class OrganizationFactory {
  constructor(private readonly db: DatabaseHelper) {}

  async create(
    options: CreateOrganizationOptions,
  ): Promise<OrganizationOrmEntity> {
    orgCounter++;
    const orgRepo = this.db.getRepository(OrganizationOrmEntity);

    const organization = orgRepo.create({
      id: uuidv4(),
      name: options.name || `Test Organization ${orgCounter}`,
      slug: options.slug || `test-org-${orgCounter}-${Date.now()}`,
      description: options.description ?? null,
      ownerId: options.ownerId,
      isActive: options.isActive ?? true,
      settings: options.settings || {},
    });

    await orgRepo.save(organization);
    return organization;
  }
}
