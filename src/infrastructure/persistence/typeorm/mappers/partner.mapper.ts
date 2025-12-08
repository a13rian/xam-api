import { Injectable } from '@nestjs/common';
import { Partner } from '../../../../core/domain/partner/entities/partner.entity';
import { PartnerType } from '../../../../core/domain/partner/value-objects/partner-type.vo';
import { PartnerStatus } from '../../../../core/domain/partner/value-objects/partner-status.vo';
import { PartnerOrmEntity } from '../entities/partner.orm-entity';

@Injectable()
export class PartnerMapper {
  toDomain(entity: PartnerOrmEntity): Partner {
    return Partner.reconstitute({
      id: entity.id,
      userId: entity.userId,
      type: PartnerType.fromString(entity.type),
      status: PartnerStatus.fromString(entity.status),
      businessName: entity.businessName,
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
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Partner): PartnerOrmEntity {
    const entity = new PartnerOrmEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.type = domain.typeValue;
    entity.status = domain.statusValue;
    entity.businessName = domain.businessName;
    entity.description = domain.description;
    entity.rating = domain.rating;
    entity.reviewCount = domain.reviewCount;
    entity.isHomeServiceEnabled = domain.isHomeServiceEnabled;
    entity.homeServiceRadiusKm = domain.homeServiceRadiusKm;
    entity.rejectionReason = domain.rejectionReason;
    entity.approvedAt = domain.approvedAt;
    entity.approvedBy = domain.approvedBy;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
