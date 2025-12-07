import { Organization } from '../entities/organization.entity';
import { PaginationOptions } from '../../../../shared/interfaces/pagination.interface';

export const ORGANIZATION_REPOSITORY = Symbol('IOrganizationRepository');

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  findByOwnerId(ownerId: string): Promise<Organization[]>;
  findAll(options?: PaginationOptions): Promise<Organization[]>;
  countAll(): Promise<number>;
  save(organization: Organization): Promise<void>;
  delete(id: string): Promise<void>;
  existsBySlug(slug: string): Promise<boolean>;
}
