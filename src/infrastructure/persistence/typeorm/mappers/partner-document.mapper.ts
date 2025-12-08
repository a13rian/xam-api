import { Injectable } from '@nestjs/common';
import { PartnerDocument } from '../../../../core/domain/partner/entities/partner-document.entity';
import { PartnerDocumentOrmEntity } from '../entities/partner-document.orm-entity';

@Injectable()
export class PartnerDocumentMapper {
  toDomain(entity: PartnerDocumentOrmEntity): PartnerDocument {
    return PartnerDocument.reconstitute({
      id: entity.id,
      partnerId: entity.partnerId,
      type: entity.type,
      url: entity.url,
      status: entity.status,
      rejectionReason: entity.rejectionReason,
      reviewedAt: entity.reviewedAt,
      reviewedBy: entity.reviewedBy,
      createdAt: entity.createdAt,
    });
  }

  toPersistence(domain: PartnerDocument): PartnerDocumentOrmEntity {
    const entity = new PartnerDocumentOrmEntity();
    entity.id = domain.id;
    entity.partnerId = domain.partnerId;
    entity.type = domain.type;
    entity.url = domain.url;
    entity.status = domain.status;
    entity.rejectionReason = domain.rejectionReason;
    entity.reviewedAt = domain.reviewedAt;
    entity.reviewedBy = domain.reviewedBy;
    entity.createdAt = domain.createdAt;
    return entity;
  }
}
