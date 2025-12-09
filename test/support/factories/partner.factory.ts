import { v4 as uuidv4 } from 'uuid';
import { DatabaseHelper } from '../database/database.helper';
import { PartnerOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/partner.orm-entity';
import { PartnerBusinessOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/partner-business.orm-entity';
import { PartnerIndividualOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/partner-individual.orm-entity';
import { PartnerTypeEnum } from '../../../src/core/domain/partner/value-objects/partner-type.vo';
import { PartnerStatusEnum } from '../../../src/core/domain/partner/value-objects/partner-status.vo';

export interface CreatePartnerOptions {
  userId: string;
  type?: PartnerTypeEnum;
  status?: PartnerStatusEnum;
  description?: string;
  isHomeServiceEnabled?: boolean;
  homeServiceRadiusKm?: number;
  // Business-specific fields
  businessName?: string;
  taxId?: string;
  businessLicense?: string;
  companySize?: string;
  website?: string;
  socialMedia?: Record<string, string>;
  establishedDate?: Date;
  // Individual-specific fields
  displayName?: string;
  idCardNumber?: string;
  specialization?: string;
  yearsExperience?: number;
  certifications?: string[];
  portfolio?: string;
  personalBio?: string;
}

export interface CreatedPartner {
  id: string;
  userId: string;
  type: PartnerTypeEnum;
  status: PartnerStatusEnum;
  description: string | null;
  businessName?: string;
  displayName?: string;
}

let partnerCounter = 0;

export class PartnerFactory {
  constructor(private readonly db: DatabaseHelper) {}

  async create(options: CreatePartnerOptions): Promise<CreatedPartner> {
    partnerCounter++;
    const partnerRepo = this.db.getRepository(PartnerOrmEntity);
    const type = options.type ?? PartnerTypeEnum.INDIVIDUAL;

    const partner = partnerRepo.create({
      id: uuidv4(),
      userId: options.userId,
      type,
      status: options.status ?? PartnerStatusEnum.PENDING,
      description: options.description ?? null,
      isHomeServiceEnabled: options.isHomeServiceEnabled ?? false,
      homeServiceRadiusKm: options.homeServiceRadiusKm ?? null,
      rating: 0,
      reviewCount: 0,
    });

    await partnerRepo.save(partner);

    let businessName: string | undefined;
    let displayName: string | undefined;

    // Create type-specific child entity
    if (type === PartnerTypeEnum.BUSINESS) {
      businessName = options.businessName ?? `Test Business ${partnerCounter}`;
      const businessRepo = this.db.getRepository(PartnerBusinessOrmEntity);
      const business = businessRepo.create({
        partnerId: partner.id,
        businessName,
        taxId: options.taxId ?? null,
        businessLicense: options.businessLicense ?? null,
        companySize: options.companySize ?? null,
        website: options.website ?? null,
        socialMedia: options.socialMedia ?? {},
        establishedDate: options.establishedDate ?? null,
      });
      await businessRepo.save(business);
    } else {
      displayName = options.displayName ?? `Test Individual ${partnerCounter}`;
      const individualRepo = this.db.getRepository(PartnerIndividualOrmEntity);
      const individual = individualRepo.create({
        partnerId: partner.id,
        displayName,
        idCardNumber: options.idCardNumber ?? null,
        specialization: options.specialization ?? null,
        yearsExperience: options.yearsExperience ?? null,
        certifications: options.certifications ?? [],
        portfolio: options.portfolio ?? null,
        personalBio: options.personalBio ?? null,
      });
      await individualRepo.save(individual);
    }

    return {
      id: partner.id,
      userId: partner.userId,
      type: partner.type,
      status: partner.status,
      description: partner.description,
      businessName,
      displayName,
    };
  }

  async createActive(options: CreatePartnerOptions): Promise<CreatedPartner> {
    return this.create({
      ...options,
      status: PartnerStatusEnum.ACTIVE,
    });
  }

  async createIndividual(
    options: CreatePartnerOptions,
  ): Promise<CreatedPartner> {
    return this.create({
      ...options,
      type: PartnerTypeEnum.INDIVIDUAL,
    });
  }

  async createBusiness(options: CreatePartnerOptions): Promise<CreatedPartner> {
    return this.create({
      ...options,
      type: PartnerTypeEnum.BUSINESS,
    });
  }

  async createActiveBusiness(
    options: CreatePartnerOptions,
  ): Promise<CreatedPartner> {
    return this.create({
      ...options,
      type: PartnerTypeEnum.BUSINESS,
      status: PartnerStatusEnum.ACTIVE,
    });
  }

  async createActiveIndividual(
    options: CreatePartnerOptions,
  ): Promise<CreatedPartner> {
    return this.create({
      ...options,
      type: PartnerTypeEnum.INDIVIDUAL,
      status: PartnerStatusEnum.ACTIVE,
    });
  }
}
