import { DatabaseHelper } from '../database/database.helper';
import { OrganizationOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/organization.orm-entity';
import { OrganizationStatusEnum } from '../../../src/core/domain/organization/value-objects/organization-status.vo';

export interface CreateOrganizationOptions {
  businessName?: string;
  status?: OrganizationStatusEnum;
  description?: string | null;
  taxId?: string | null;
  businessLicense?: string | null;
  companySize?: string | null;
  website?: string | null;
  isHomeServiceEnabled?: boolean;
  homeServiceRadiusKm?: number | null;
}

export interface CreatedOrganization {
  id: string;
  businessName: string;
  status: OrganizationStatusEnum;
  description: string | null;
}

let organizationCounter = 0;

export class OrganizationFactory {
  constructor(private readonly db: DatabaseHelper) {}

  async create(
    options: CreateOrganizationOptions = {},
  ): Promise<CreatedOrganization> {
    organizationCounter++;
    const orgRepo = this.db.getRepository(OrganizationOrmEntity);

    const organization = orgRepo.create({
      id: this.generateOrganizationId(),
      businessName:
        options.businessName ?? `Organization ${organizationCounter}`,
      status: options.status ?? OrganizationStatusEnum.ACTIVE,
      description: options.description ?? null,
      taxId: options.taxId ?? null,
      businessLicense: options.businessLicense ?? null,
      companySize: options.companySize ?? null,
      website: options.website ?? null,
      isHomeServiceEnabled: options.isHomeServiceEnabled ?? false,
      homeServiceRadiusKm: options.homeServiceRadiusKm ?? null,
      rating: 0,
      reviewCount: 0,
      socialMedia: {},
    });

    await orgRepo.save(organization);

    return {
      id: organization.id,
      businessName: organization.businessName,
      status: organization.status,
      description: organization.description,
    };
  }

  async createActive(
    options: CreateOrganizationOptions = {},
  ): Promise<CreatedOrganization> {
    return this.create({
      ...options,
      status: OrganizationStatusEnum.ACTIVE,
    });
  }

  async createPending(
    options: CreateOrganizationOptions = {},
  ): Promise<CreatedOrganization> {
    return this.create({
      ...options,
      status: OrganizationStatusEnum.PENDING,
    });
  }

  private generateOrganizationId(): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let result = 'org_';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
