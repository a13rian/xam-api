import { v4 as uuidv4 } from 'uuid';
import { DatabaseHelper } from '../database/database.helper';
import { PartnerOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/partner.orm-entity';
import { PartnerTypeEnum } from '../../../src/core/domain/partner/value-objects/partner-type.vo';
import { PartnerStatusEnum } from '../../../src/core/domain/partner/value-objects/partner-status.vo';

export interface CreatePartnerOptions {
  userId: string;
  type?: PartnerTypeEnum;
  status?: PartnerStatusEnum;
  businessName?: string;
  description?: string;
  isHomeServiceEnabled?: boolean;
  homeServiceRadiusKm?: number;
}

export interface CreatedPartner {
  id: string;
  userId: string;
  type: PartnerTypeEnum;
  status: PartnerStatusEnum;
  businessName: string;
  description: string | null;
}

let partnerCounter = 0;

export class PartnerFactory {
  constructor(private readonly db: DatabaseHelper) {}

  async create(options: CreatePartnerOptions): Promise<CreatedPartner> {
    partnerCounter++;
    const partnerRepo = this.db.getRepository(PartnerOrmEntity);

    const partner = partnerRepo.create({
      id: uuidv4(),
      userId: options.userId,
      type: options.type ?? PartnerTypeEnum.FREELANCE,
      status: options.status ?? PartnerStatusEnum.PENDING,
      businessName: options.businessName ?? `Test Business ${partnerCounter}`,
      description: options.description ?? null,
      isHomeServiceEnabled: options.isHomeServiceEnabled ?? false,
      homeServiceRadiusKm: options.homeServiceRadiusKm ?? null,
      rating: 0,
      reviewCount: 0,
    });

    await partnerRepo.save(partner);

    return {
      id: partner.id,
      userId: partner.userId,
      type: partner.type,
      status: partner.status,
      businessName: partner.businessName,
      description: partner.description,
    };
  }

  async createActive(options: CreatePartnerOptions): Promise<CreatedPartner> {
    return this.create({
      ...options,
      status: PartnerStatusEnum.ACTIVE,
    });
  }

  async createOrganization(
    options: CreatePartnerOptions,
  ): Promise<CreatedPartner> {
    return this.create({
      ...options,
      type: PartnerTypeEnum.ORGANIZATION,
    });
  }

  async createActiveOrganization(
    options: CreatePartnerOptions,
  ): Promise<CreatedPartner> {
    return this.create({
      ...options,
      type: PartnerTypeEnum.ORGANIZATION,
      status: PartnerStatusEnum.ACTIVE,
    });
  }
}
