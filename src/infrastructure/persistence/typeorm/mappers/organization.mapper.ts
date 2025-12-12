import { Injectable } from '@nestjs/common';
import { Organization } from '../../../../core/domain/organization/entities/organization.entity';
import { OrganizationStatus } from '../../../../core/domain/organization/value-objects/organization-status.vo';
import { OrganizationOrmEntity } from '../entities/organization.orm-entity';

@Injectable()
export class OrganizationMapper {
  toDomain(entity: OrganizationOrmEntity): Organization {
    return Organization.reconstitute({
      id: entity.id,
      status: OrganizationStatus.fromString(entity.status),
      description: entity.description,
      rating: Number(entity.rating),
      reviewCount: entity.reviewCount,
      isHomeServiceEnabled: entity.isHomeServiceEnabled,
      homeServiceRadiusKm: entity.homeServiceRadiusKm
        ? Number(entity.homeServiceRadiusKm)
        : null,
      rejectionReason: entity.rejectionReason,
      approvedAt: entity.approvedAt,
      approvedBy: entity.approvedBy,
      businessName: entity.businessName,
      taxId: entity.taxId,
      businessLicense: entity.businessLicense,
      companySize: entity.companySize,
      website: entity.website,
      socialMedia: entity.socialMedia,
      establishedDate: entity.establishedDate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Organization): OrganizationOrmEntity {
    const entity = new OrganizationOrmEntity();
    entity.id = domain.id;
    entity.status = domain.statusValue;
    entity.description = domain.description;
    entity.rating = domain.rating;
    entity.reviewCount = domain.reviewCount;
    entity.isHomeServiceEnabled = domain.isHomeServiceEnabled;
    entity.homeServiceRadiusKm = domain.homeServiceRadiusKm;
    entity.rejectionReason = domain.rejectionReason;
    entity.approvedAt = domain.approvedAt;
    entity.approvedBy = domain.approvedBy;
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
