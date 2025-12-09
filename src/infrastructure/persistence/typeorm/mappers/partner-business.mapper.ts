import { Injectable } from '@nestjs/common';
import { PartnerBusiness } from '../../../../core/domain/partner/entities/partner-business.entity';
import { PartnerBusinessOrmEntity } from '../entities/partner-business.orm-entity';

@Injectable()
export class PartnerBusinessMapper {
  toDomain(entity: PartnerBusinessOrmEntity): PartnerBusiness {
    return PartnerBusiness.reconstitute({
      partnerId: entity.partnerId,
      businessName: entity.businessName,
      taxId: entity.taxId,
      businessLicense: entity.businessLicense,
      companySize: entity.companySize,
      website: entity.website,
      socialMedia: entity.socialMedia ?? {},
      establishedDate: entity.establishedDate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: PartnerBusiness): PartnerBusinessOrmEntity {
    const entity = new PartnerBusinessOrmEntity();
    entity.partnerId = domain.partnerId;
    entity.businessName = domain.businessName;
    entity.taxId = domain.taxId;
    entity.businessLicense = domain.businessLicense;
    entity.companySize = domain.companySize;
    entity.website = domain.website;
    entity.socialMedia = domain.socialMedia;
    entity.establishedDate = domain.establishedDate;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
