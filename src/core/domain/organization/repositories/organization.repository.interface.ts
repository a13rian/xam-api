import { Organization } from '../entities/organization.entity';
import { OrganizationStatusEnum } from '../value-objects/organization-status.vo';
import { PaginationOptions } from '../../../../shared/interfaces/pagination.interface';

export const ORGANIZATION_REPOSITORY = Symbol('IOrganizationRepository');

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findByStatus(
    status: OrganizationStatusEnum,
    options?: PaginationOptions,
  ): Promise<Organization[]>;
  countByStatus(status: OrganizationStatusEnum): Promise<number>;
  findAll(options?: PaginationOptions): Promise<Organization[]>;
  countAll(): Promise<number>;
  save(organization: Organization): Promise<void>;
  delete(id: string): Promise<void>;
}
