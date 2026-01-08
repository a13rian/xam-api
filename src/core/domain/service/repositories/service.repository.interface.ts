import { Service } from '../entities/service.entity';

export const SERVICE_REPOSITORY = Symbol('SERVICE_REPOSITORY');

export interface ServiceSearchOptions {
  organizationId?: string;
  categoryId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ServiceSearchResult {
  items: Service[];
  total: number;
  page: number;
  limit: number;
}

export interface IServiceRepository {
  findById(id: string): Promise<Service | null>;
  findByIds(ids: string[]): Promise<Service[]>;
  findByOrganizationId(organizationId: string): Promise<Service[]>;
  findByCategoryId(categoryId: string): Promise<Service[]>;
  search(options: ServiceSearchOptions): Promise<ServiceSearchResult>;
  save(service: Service): Promise<void>;
  delete(id: string): Promise<void>;
  existsByOrganizationIdAndName(
    organizationId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean>;
}
